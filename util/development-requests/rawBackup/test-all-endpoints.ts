import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

// Configuration
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000/api';
const EPD_URL = process.env.EPD_API_URL || 'http://localhost:3002';
const MAIL_URL = process.env.MAIL_API_URL || 'http://localhost:3001';
const AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || '';

interface TestResult {
  service: string;
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  statusCode?: number;
  error?: string;
  responseTime?: number;
}

const results: TestResult[] = [];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function getAuth0Token(): Promise<string | null> {
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_AUDIENCE) {
    log('??  Missing Auth0 credentials - skipping authenticated endpoints', colors.yellow);
    return null;
  }

  try {
    log('\n?? Requesting Auth0 M2M token...', colors.cyan);
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: AUTH0_AUDIENCE,
      grant_type: 'client_credentials'
    });
    
    log('? Token received successfully', colors.green);
    return response.data.access_token;
  } catch (error: any) {
    log(`? Failed to get Auth0 token: ${error.message}`, colors.red);
    return null;
  }
}

async function testEndpoint(
  service: string,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  token?: string | null,
  body?: any
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios({
      method,
      url: endpoint,
      headers,
      data: body,
      timeout: 5000
    });

    const responseTime = Date.now() - startTime;
    
    return {
      service,
      endpoint,
      method,
      status: 'PASS',
      statusCode: response.status,
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    if (error.code === 'ECONNREFUSED') {
      return {
        service,
        endpoint,
        method,
        status: 'FAIL',
        error: 'Connection refused - service not running',
        responseTime
      };
    }

    const axiosError = error as AxiosError;
    return {
      service,
      endpoint,
      method,
      status: 'FAIL',
      statusCode: axiosError.response?.status,
      error: axiosError.message,
      responseTime
    };
  }
}

async function testService(serviceName: string, baseUrl: string, endpoints: any[], token?: string | null) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(`Testing ${serviceName}`, colors.cyan);
  log(`Base URL: ${baseUrl}`, colors.gray);
  log(`${'='.repeat(60)}`, colors.blue);

  for (const ep of endpoints) {
    const requiresAuth = ep.requiresAuth !== false;
    
    if (requiresAuth && !token) {
      const result: TestResult = {
        service: serviceName,
        endpoint: ep.path,
        method: ep.method,
        status: 'SKIP',
        error: 'No authentication token available'
      };
      results.push(result);
      log(`? ${ep.method} ${ep.path} - SKIPPED (no auth)`, colors.yellow);
      continue;
    }

    const fullUrl = `${baseUrl}${ep.path}`;
    const result = await testEndpoint(
      serviceName,
      fullUrl,
      ep.method,
      requiresAuth ? token : undefined,
      ep.body
    );
    
    results.push(result);

    const statusSymbol = result.status === 'PASS' ? '?' : '?';
    const statusColor = result.status === 'PASS' ? colors.green : colors.red;
    const timeInfo = result.responseTime ? ` (${result.responseTime}ms)` : '';
    const statusCodeInfo = result.statusCode ? ` [${result.statusCode}]` : '';
    
    log(
      `${statusSymbol} ${result.method} ${ep.path}${statusCodeInfo}${timeInfo}`,
      statusColor
    );
    
    if (result.error) {
      log(`   Error: ${result.error}`, colors.gray);
    }
  }
}

function generateReport() {
  log('\n\n' + '='.repeat(60), colors.blue);
  log('?? TEST SUMMARY REPORT', colors.cyan);
  log('='.repeat(60), colors.blue);

  const services = [...new Set(results.map(r => r.service))];
  
  services.forEach(service => {
    const serviceResults = results.filter(r => r.service === service);
    const passed = serviceResults.filter(r => r.status === 'PASS').length;
    const failed = serviceResults.filter(r => r.status === 'FAIL').length;
    const skipped = serviceResults.filter(r => r.status === 'SKIP').length;
    const total = serviceResults.length;

    log(`\n${service}:`, colors.cyan);
    log(`  ? Passed:  ${passed}/${total}`, colors.green);
    log(`  ? Failed:  ${failed}/${total}`, failed > 0 ? colors.red : colors.gray);
    log(`  ? Skipped: ${skipped}/${total}`, skipped > 0 ? colors.yellow : colors.gray);
  });

  const totalPassed = results.filter(r => r.status === 'PASS').length;
  const totalFailed = results.filter(r => r.status === 'FAIL').length;
  const totalSkipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;

  log('\n' + '-'.repeat(60), colors.gray);
  log('Overall:', colors.cyan);
  log(`  ? Total Passed:  ${totalPassed}/${total}`, colors.green);
  log(`  ? Total Failed:  ${totalFailed}/${total}`, totalFailed > 0 ? colors.red : colors.gray);
  log(`  ? Total Skipped: ${totalSkipped}/${total}`, totalSkipped > 0 ? colors.yellow : colors.gray);
  
  const successRate = total > 0 ? ((totalPassed / (total - totalSkipped)) * 100).toFixed(1) : '0.0';
  log(`\n  Success Rate: ${successRate}%`, totalFailed === 0 ? colors.green : colors.yellow);

  log('\n' + '='.repeat(60), colors.blue);
}

function generateMarkdownReport() {
  const timestamp = new Date().toISOString();
  let markdown = `# API Endpoint Test Report\n\n`;
  markdown += `**Generated:** ${timestamp}\n\n`;
  markdown += `---\n\n`;

  const services = [...new Set(results.map(r => r.service))];
  
  services.forEach(service => {
    const serviceResults = results.filter(r => r.service === service);
    const passed = serviceResults.filter(r => r.status === 'PASS').length;
    const failed = serviceResults.filter(r => r.status === 'FAIL').length;
    const skipped = serviceResults.filter(r => r.status === 'SKIP').length;

    markdown += `## ${service}\n\n`;
    markdown += `- ? Passed: ${passed}\n`;
    markdown += `- ? Failed: ${failed}\n`;
    markdown += `- ? Skipped: ${skipped}\n\n`;

    markdown += `| Method | Endpoint | Status | Status Code | Response Time | Error |\n`;
    markdown += `|--------|----------|--------|-------------|---------------|-------|\n`;

    serviceResults.forEach(result => {
      const statusEmoji = result.status === 'PASS' ? '?' : result.status === 'FAIL' ? '?' : '?';
      const statusCode = result.statusCode || '-';
      const responseTime = result.responseTime ? `${result.responseTime}ms` : '-';
      const error = result.error ? result.error.substring(0, 50) : '-';
      
      markdown += `| ${result.method} | ${result.endpoint} | ${statusEmoji} ${result.status} | ${statusCode} | ${responseTime} | ${error} |\n`;
    });

    markdown += `\n`;
  });

  markdown += `## Summary\n\n`;
  const totalPassed = results.filter(r => r.status === 'PASS').length;
  const totalFailed = results.filter(r => r.status === 'FAIL').length;
  const totalSkipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;
  const successRate = total > 0 ? ((totalPassed / (total - totalSkipped)) * 100).toFixed(1) : '0.0';

  markdown += `- **Total Tests:** ${total}\n`;
  markdown += `- **Passed:** ${totalPassed}\n`;
  markdown += `- **Failed:** ${totalFailed}\n`;
  markdown += `- **Skipped:** ${totalSkipped}\n`;
  markdown += `- **Success Rate:** ${successRate}%\n`;

  return markdown;
}

async function main() {
  log('?? Starting Endpoint Test Suite', colors.cyan);
  log('?'.repeat(60), colors.blue);

  // Get Auth0 token
  const token = await getAuth0Token();

  // Test FastAPI Backend
  await testService('FastAPI Backend', FASTAPI_URL, [
    { method: 'GET', path: '/', requiresAuth: false },
    { method: 'POST', path: '/auth/login/', requiresAuth: false },
    { method: 'GET', path: '/patient/', requiresAuth: true },
    { method: 'GET', path: '/patient/1', requiresAuth: true },
    { method: 'GET', path: '/encounters/', requiresAuth: true },
    { method: 'GET', path: '/encounters/1', requiresAuth: true },
    { method: 'GET', path: '/mails/user/1', requiresAuth: true },
    { method: 'GET', path: '/mails/user/1/count', requiresAuth: true },
  ], token);

  // Test EPD Backend
  await testService('EPD Backend', EPD_URL, [
    { method: 'GET', path: '/health', requiresAuth: false },
    { method: 'GET', path: '/api/users', requiresAuth: true },
    { method: 'GET', path: '/api/patients?page=1&limit=5', requiresAuth: true },
    { method: 'GET', path: '/api/encounters?page=1&limit=5', requiresAuth: true },
    { method: 'GET', path: '/api/medications?page=1&limit=5', requiresAuth: true },
    { method: 'GET', path: '/api/allergies?page=1&limit=5', requiresAuth: true },
    { method: 'GET', path: '/api/vitals?page=1&limit=5', requiresAuth: true },
    { method: 'GET', path: '/api/lab-results?page=1&limit=5', requiresAuth: true },
    { method: 'GET', path: '/api/appointments?page=1&limit=5', requiresAuth: true },
    { method: 'GET', path: '/api/insurance/insurers?page=1&limit=5', requiresAuth: true },
    { method: 'GET', path: '/api/insurance/policies?page=1&limit=5', requiresAuth: true },
  ], token);

  // Test Mail Service
  await testService('Mail Service', MAIL_URL, [
    { method: 'GET', path: '/health', requiresAuth: false },
    { method: 'GET', path: '/api/mails/user/test-user-id/count', requiresAuth: true },
    { method: 'GET', path: '/api/mails/user/test-user-id', requiresAuth: true },
  ], token);

  // Generate reports
  generateReport();

  const markdown = generateMarkdownReport();
  const reportPath = 'TEST_REPORT.md';
  fs.writeFileSync(reportPath, markdown);
  
  log(`\n?? Detailed report saved to: ${reportPath}`, colors.cyan);

  // Exit with error code if any tests failed
  const hasFailed = results.some(r => r.status === 'FAIL');
  process.exit(hasFailed ? 1 : 0);
}

main().catch(error => {
  log(`\n? Test suite crashed: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
