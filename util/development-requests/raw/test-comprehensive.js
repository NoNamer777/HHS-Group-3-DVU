#!/usr/bin/env node
/**
 * Comprehensive API Endpoint Test Suite
 * Tests all endpoints and generates detailed documentation
 * 
 * Run with: node test-comprehensive.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');

const results = [];
let globalToken = null;

// ===== HTTP Request Helper =====
async function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https');
        const lib = isHttps ? https : http;
        
        const urlObj = new URL(url);
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: 10000
        };
        
        const req = lib.request(reqOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch(e) {}
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    data: data,
                    json: parsed,
                    headers: res.headers
                });
            });
        });
        
        req.on('error', (e) => resolve({ status: 0, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
        
        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

// ===== Test Helper =====
async function testEndpoint(config) {
    const { service, name, url, method = 'GET', headers = {}, body, expectStatus = [200, 201], auth = true } = config;
    
    const finalHeaders = { ...headers };
    if (auth && globalToken) {
        finalHeaders['Authorization'] = `Bearer ${globalToken}`;
    }
    
    const start = Date.now();
    const result = await request(url, { method, headers: finalHeaders, body });
    const time = Date.now() - start;
    
    const isSuccess = expectStatus.includes(result.status);
    const status = isSuccess ? 'PASS' : 
                   result.status === 401 ? 'AUTH' : 
                   result.status === 403 ? 'FORBIDDEN' : 
                   result.status === 404 ? 'NOT_FOUND' : 'FAIL';
    
    const testResult = {
        service,
        name,
        url,
        method,
        auth,
        status,
        statusCode: result.status,
        statusText: result.statusText,
        time,
        error: result.error,
        requestBody: body,
        requestHeaders: Object.keys(finalHeaders).filter(h => h.toLowerCase() !== 'authorization'),
        response: result.json || (result.data ? result.data.substring(0, 500) : null),
        responsePreview: result.json ? JSON.stringify(result.json).substring(0, 200) : null
    };
    
    results.push(testResult);
    
    const emoji = status === 'PASS' ? '?' : 
                  status === 'AUTH' ? '??' : 
                  status === 'FORBIDDEN' ? '??' : 
                  status === 'NOT_FOUND' ? '??' : '?';
    
    console.log(`${emoji} ${method.padEnd(6)} ${name.padEnd(35)} [${result.status}] (${time}ms)`);
    if (result.error) console.log(`         Error: ${result.error}`);
    
    return result;
}

// ===== Test Suites =====

async function testFastAPIBackend() {
    console.log('\n' + '='.repeat(70));
    console.log('?? FASTAPI BACKEND (Port 8000)');
    console.log('='.repeat(70));
    
    // Health & Auth
    console.log('\n--- Health & Authentication ---');
    await testEndpoint({
        service: 'FastAPI',
        name: 'Root Health Check',
        url: 'http://localhost:8000/api/',
        auth: false
    });
    
    const authResult = await testEndpoint({
        service: 'FastAPI',
        name: 'Auth Login (Get Token)',
        url: 'http://localhost:8000/api/auth/login/',
        method: 'POST',
        auth: false
    });
    
    if (authResult.json && authResult.json.access_token) {
        globalToken = authResult.json.access_token;
        console.log('   ?? Token obtained and stored for subsequent requests');
    }
    
    // Patients
    console.log('\n--- Patients ---');
    await testEndpoint({
        service: 'FastAPI',
        name: 'List Patients',
        url: 'http://localhost:8000/api/patient/'
    });
    
    await testEndpoint({
        service: 'FastAPI',
        name: 'List Patients (with limit)',
        url: 'http://localhost:8000/api/patient/?limit=5&offset=0'
    });
    
    await testEndpoint({
        service: 'FastAPI',
        name: 'Get Patient by ID',
        url: 'http://localhost:8000/api/patient/1'
    });
    
    // Encounters
    console.log('\n--- Encounters ---');
    await testEndpoint({
        service: 'FastAPI',
        name: 'List Encounters',
        url: 'http://localhost:8000/api/encounters/'
    });
    
    await testEndpoint({
        service: 'FastAPI',
        name: 'List Encounters (with filters)',
        url: 'http://localhost:8000/api/encounters/?page=1&limit=10'
    });
    
    await testEndpoint({
        service: 'FastAPI',
        name: 'Get Encounter by ID',
        url: 'http://localhost:8000/api/encounters/1'
    });
    
    // Mails
    console.log('\n--- Mails ---');
    await testEndpoint({
        service: 'FastAPI',
        name: 'Get User Mails',
        url: 'http://localhost:8000/api/mails/user/1'
    });
    
    await testEndpoint({
        service: 'FastAPI',
        name: 'Get User Mail Count',
        url: 'http://localhost:8000/api/mails/user/1/count'
    });
}

async function testEPDBackend() {
    console.log('\n' + '='.repeat(70));
    console.log('?? EPD BACKEND (Port 3001)');
    console.log('='.repeat(70));
    
    // Health
    console.log('\n--- Health ---');
    await testEndpoint({
        service: 'EPD',
        name: 'Health Check',
        url: 'http://localhost:3001/health',
        auth: false
    });
    
    // Users
    console.log('\n--- Users ---');
    await testEndpoint({
        service: 'EPD',
        name: 'List Users',
        url: 'http://localhost:3001/api/users'
    });
    
    await testEndpoint({
        service: 'EPD',
        name: 'Get User by ID',
        url: 'http://localhost:3001/api/users/1'
    });
    
    // Patients
    console.log('\n--- Patients ---');
    const patientsResult = await testEndpoint({
        service: 'EPD',
        name: 'List Patients',
        url: 'http://localhost:3001/api/patients'
    });
    
    await testEndpoint({
        service: 'EPD',
        name: 'List Patients (paginated)',
        url: 'http://localhost:3001/api/patients?page=1&limit=5'
    });
    
    // Get a valid patient ID from the list
    let validPatientId = null;
    if (patientsResult.json && patientsResult.json.patients && patientsResult.json.patients[0]) {
        validPatientId = patientsResult.json.patients[0].id;
    }
    
    await testEndpoint({
        service: 'EPD',
        name: 'Get Patient by ID',
        url: `http://localhost:3001/api/patients/${validPatientId || 1}`
    });
    
    await testEndpoint({
        service: 'EPD',
        name: 'Search Patients',
        url: 'http://localhost:3001/api/patients?search=Anna'
    });
    
    // Encounters
    console.log('\n--- Encounters ---');
    const encountersResult = await testEndpoint({
        service: 'EPD',
        name: 'List Encounters',
        url: 'http://localhost:3001/api/encounters'
    });
    
    await testEndpoint({
        service: 'EPD',
        name: 'List Encounters (paginated)',
        url: 'http://localhost:3001/api/encounters?page=1&limit=5'
    });
    
    let validEncounterId = null;
    if (encountersResult.json && encountersResult.json.encounters && encountersResult.json.encounters[0]) {
        validEncounterId = encountersResult.json.encounters[0].id;
    }
    
    await testEndpoint({
        service: 'EPD',
        name: 'Get Encounter by ID',
        url: `http://localhost:3001/api/encounters/${validEncounterId || 1}`
    });
    
    // Medications
    console.log('\n--- Medications ---');
    await testEndpoint({
        service: 'EPD',
        name: 'List Medications',
        url: 'http://localhost:3001/api/medications'
    });
    
    await testEndpoint({
        service: 'EPD',
        name: 'List Medications (paginated)',
        url: 'http://localhost:3001/api/medications?page=1&limit=5'
    });
    
    // Allergies
    console.log('\n--- Allergies ---');
    const allergiesResult = await testEndpoint({
        service: 'EPD',
        name: 'List Allergies',
        url: 'http://localhost:3001/api/allergies'
    });
    
    let validAllergyId = null;
    if (allergiesResult.json && allergiesResult.json.allergies && allergiesResult.json.allergies[0]) {
        validAllergyId = allergiesResult.json.allergies[0].id;
    }
    
    await testEndpoint({
        service: 'EPD',
        name: 'Get Allergy by ID',
        url: `http://localhost:3001/api/allergies/${validAllergyId || 1}`
    });
    
    // Vitals
    console.log('\n--- Vitals ---');
    await testEndpoint({
        service: 'EPD',
        name: 'List Vitals',
        url: 'http://localhost:3001/api/vitals'
    });
    
    await testEndpoint({
        service: 'EPD',
        name: 'List Vitals (paginated)',
        url: 'http://localhost:3001/api/vitals?page=1&limit=5'
    });
    
    // Lab Results
    console.log('\n--- Lab Results ---');
    await testEndpoint({
        service: 'EPD',
        name: 'List Lab Results',
        url: 'http://localhost:3001/api/lab-results'
    });
    
    await testEndpoint({
        service: 'EPD',
        name: 'List Lab Results (paginated)',
        url: 'http://localhost:3001/api/lab-results?page=1&limit=5'
    });
    
    // Appointments
    console.log('\n--- Appointments ---');
    await testEndpoint({
        service: 'EPD',
        name: 'List Appointments',
        url: 'http://localhost:3001/api/appointments'
    });
    
    await testEndpoint({
        service: 'EPD',
        name: 'List Appointments (paginated)',
        url: 'http://localhost:3001/api/appointments?page=1&limit=5'
    });
    
    // Insurance
    console.log('\n--- Insurance ---');
    await testEndpoint({
        service: 'EPD',
        name: 'List Insurers',
        url: 'http://localhost:3001/api/insurance/insurers'
    });
    
    await testEndpoint({
        service: 'EPD',
        name: 'List Insurance Policies',
        url: 'http://localhost:3001/api/insurance/policies'
    });
    
    // Medical Records
    console.log('\n--- Medical Records ---');
    await testEndpoint({
        service: 'EPD',
        name: 'List Medical Records',
        url: 'http://localhost:3001/api/medical-records'
    });
    
    // Diagnoses
    console.log('\n--- Diagnoses ---');
    await testEndpoint({
        service: 'EPD',
        name: 'List Diagnoses',
        url: 'http://localhost:3001/api/diagnoses'
    });
    
    // Test without auth
    console.log('\n--- Auth Verification (should fail) ---');
    const originalToken = globalToken;
    globalToken = null;
    
    await testEndpoint({
        service: 'EPD-NoAuth',
        name: 'List Patients (no auth)',
        url: 'http://localhost:3001/api/patients',
        auth: false,
        expectStatus: [401]
    });
    
    globalToken = originalToken;
}

async function testMailService() {
    console.log('\n' + '='.repeat(70));
    console.log('?? MAIL SERVICE (Port 3002)');
    console.log('='.repeat(70));
    
    // Health
    console.log('\n--- Health ---');
    await testEndpoint({
        service: 'Mail',
        name: 'Health Check',
        url: 'http://localhost:3002/health',
        auth: false
    });
    
    // Mail endpoints
    console.log('\n--- Mail Endpoints ---');
    await testEndpoint({
        service: 'Mail',
        name: 'Get User Mail Count',
        url: 'http://localhost:3002/api/mails/user/test-user/count'
    });
    
    await testEndpoint({
        service: 'Mail',
        name: 'Get User Mails',
        url: 'http://localhost:3002/api/mails/user/test-user'
    });
}

// ===== Report Generation =====

function generateMarkdownReport() {
    const timestamp = new Date().toISOString();
    let md = `# API Endpoint Test Report\n\n`;
    md += `**Generated:** ${timestamp}\n\n`;
    md += `---\n\n`;
    
    // Summary
    const summary = {};
    results.forEach(r => {
        if (!summary[r.service]) summary[r.service] = { pass: 0, fail: 0, auth: 0, forbidden: 0, notFound: 0 };
        if (r.status === 'PASS') summary[r.service].pass++;
        else if (r.status === 'AUTH') summary[r.service].auth++;
        else if (r.status === 'FORBIDDEN') summary[r.service].forbidden++;
        else if (r.status === 'NOT_FOUND') summary[r.service].notFound++;
        else summary[r.service].fail++;
    });
    
    md += `## Summary\n\n`;
    md += `| Service | ? Pass | ?? Auth | ?? Forbidden | ?? Not Found | ? Fail |\n`;
    md += `|---------|---------|---------|--------------|--------------|--------|\n`;
    Object.entries(summary).forEach(([service, counts]) => {
        md += `| ${service} | ${counts.pass} | ${counts.auth} | ${counts.forbidden} | ${counts.notFound} | ${counts.fail} |\n`;
    });
    md += `\n---\n\n`;
    
    // By Service
    const services = [...new Set(results.map(r => r.service))];
    services.forEach(service => {
        const serviceResults = results.filter(r => r.service === service);
        md += `## ${service}\n\n`;
        
        md += `| Status | Method | Endpoint | Response Code | Time |\n`;
        md += `|--------|--------|----------|---------------|------|\n`;
        
        serviceResults.forEach(r => {
            const emoji = r.status === 'PASS' ? '?' : 
                          r.status === 'AUTH' ? '??' : 
                          r.status === 'FORBIDDEN' ? '??' : 
                          r.status === 'NOT_FOUND' ? '??' : '?';
            md += `| ${emoji} | ${r.method} | \`${r.url}\` | ${r.statusCode} | ${r.time}ms |\n`;
        });
        md += `\n`;
    });
    
    // Detailed Endpoint Documentation
    md += `---\n\n## Detailed Endpoint Documentation\n\n`;
    
    services.forEach(service => {
        const serviceResults = results.filter(r => r.service === service);
        md += `### ${service}\n\n`;
        
        serviceResults.forEach(r => {
            const emoji = r.status === 'PASS' ? '?' : 
                          r.status === 'AUTH' ? '??' : 
                          r.status === 'FORBIDDEN' ? '??' : 
                          r.status === 'NOT_FOUND' ? '??' : '?';
            
            md += `#### ${emoji} ${r.name}\n\n`;
            md += `- **URL:** \`${r.url}\`\n`;
            md += `- **Method:** \`${r.method}\`\n`;
            md += `- **Auth Required:** ${r.auth ? 'Yes' : 'No'}\n`;
            md += `- **Status:** ${r.statusCode} ${r.statusText || ''}\n`;
            md += `- **Response Time:** ${r.time}ms\n`;
            
            if (r.requestBody) {
                md += `- **Request Body:**\n\`\`\`json\n${JSON.stringify(r.requestBody, null, 2)}\n\`\`\`\n`;
            }
            
            if (r.response && r.status === 'PASS') {
                const preview = typeof r.response === 'object' 
                    ? JSON.stringify(r.response, null, 2).substring(0, 500)
                    : r.response.substring(0, 500);
                md += `- **Response Preview:**\n\`\`\`json\n${preview}${preview.length >= 500 ? '...' : ''}\n\`\`\`\n`;
            }
            
            if (r.error) {
                md += `- **Error:** ${r.error}\n`;
            }
            
            md += `\n`;
        });
    });
    
    return md;
}

function generateJMeterCSV() {
    let csv = 'Service,Name,URL,Method,AuthRequired,Status,StatusCode,Time\n';
    results.forEach(r => {
        csv += `"${r.service}","${r.name}","${r.url}","${r.method}",${r.auth},${r.status},${r.statusCode},${r.time}\n`;
    });
    return csv;
}

// ===== Main =====

async function main() {
    console.log('='.repeat(70));
    console.log('?? COMPREHENSIVE API ENDPOINT TEST SUITE');
    console.log('='.repeat(70));
    console.log(`Started at: ${new Date().toISOString()}\n`);
    
    try {
        await testFastAPIBackend();
        await testEPDBackend();
        await testMailService();
    } catch (error) {
        console.error('Test suite error:', error);
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('?? FINAL SUMMARY');
    console.log('='.repeat(70));
    
    const summary = {};
    results.forEach(r => {
        if (!summary[r.service]) summary[r.service] = { pass: 0, fail: 0, auth: 0, forbidden: 0, notFound: 0, total: 0 };
        summary[r.service].total++;
        if (r.status === 'PASS') summary[r.service].pass++;
        else if (r.status === 'AUTH') summary[r.service].auth++;
        else if (r.status === 'FORBIDDEN') summary[r.service].forbidden++;
        else if (r.status === 'NOT_FOUND') summary[r.service].notFound++;
        else summary[r.service].fail++;
    });
    
    Object.entries(summary).forEach(([service, counts]) => {
        console.log(`\n${service}:`);
        console.log(`  ? Pass:       ${counts.pass}/${counts.total}`);
        console.log(`  ?? Auth:       ${counts.auth}/${counts.total}`);
        console.log(`  ?? Forbidden:  ${counts.forbidden}/${counts.total}`);
        console.log(`  ?? Not Found:  ${counts.notFound}/${counts.total}`);
        console.log(`  ? Fail:       ${counts.fail}/${counts.total}`);
    });
    
    const totalPass = results.filter(r => r.status === 'PASS').length;
    const total = results.length;
    console.log(`\nOverall: ${totalPass}/${total} passed (${(totalPass/total*100).toFixed(1)}%)`);
    
    // Save reports
    console.log('\n' + '='.repeat(70));
    console.log('?? SAVING REPORTS');
    console.log('='.repeat(70));
    
    fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
    console.log('? test-results.json');
    
    fs.writeFileSync('TEST_REPORT.md', generateMarkdownReport());
    console.log('? TEST_REPORT.md');
    
    fs.writeFileSync('test-results.csv', generateJMeterCSV());
    console.log('? test-results.csv (for JMeter/Excel import)');
    
    console.log(`\nCompleted at: ${new Date().toISOString()}`);
}

main().catch(console.error);
