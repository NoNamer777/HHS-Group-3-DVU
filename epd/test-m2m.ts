import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || '';
const EPD_API_URL = process.env.EPD_API_URL || 'http://localhost:3002';

async function getAuth0Token(): Promise<string> {
  console.log('🔑 Requesting Auth0 M2M token...');
  console.log(`   Domain: ${AUTH0_DOMAIN}`);
  console.log(`   Audience: ${AUTH0_AUDIENCE}`);

  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: AUTH0_AUDIENCE,
      grant_type: 'client_credentials'
    });

    console.log('✅ Token received successfully\n');
    return response.data.access_token;
  } catch (error: any) {
    console.error('❌ Failed to get Auth0 token:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
    }
    throw error;
  }
}

async function testEPDEndpoint(token: string, endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
  const url = `${EPD_API_URL}${endpoint}`;
  console.log(`📡 Testing ${method} ${endpoint}...`);

  try {
    const response = await axios({
      method,
      url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data
    });

    console.log(`✅ Success (${response.status})`);
    console.log('   Response:', JSON.stringify(response.data, null, 2).substring(0, 500));
    if (JSON.stringify(response.data).length > 500) {
      console.log('   ... (truncated)');
    }
    console.log();
    return response.data;
  } catch (error: any) {
    console.error(`❌ Failed (${error.response?.status || 'ERROR'})`);
    if (error.response) {
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
    }
    console.log();
    throw error;
  }
}

async function main() {
  console.log('🏥 EPD API - Auth0 M2M Test');
  console.log('='.repeat(50));
  console.log();

  // Validate environment variables
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_AUDIENCE) {
    console.error('❌ Missing Auth0 environment variables!');
    console.error('   Please configure .env with:');
    console.error('   - AUTH0_ISSUER_BASE_URL');
    console.error('   - AUTH0_CLIENT_ID');
    console.error('   - AUTH0_CLIENT_SECRET');
    console.error('   - AUTH0_AUDIENCE');
    process.exit(1);
  }

  try {
    // Step 1: Get Auth0 token
    const token = await getAuth0Token();

    // Step 2: Test health endpoint (no auth required)
    console.log('📋 Testing public endpoints...');
    await axios.get(`${EPD_API_URL}/health`);
    console.log('✅ Health check OK\n');

    // Step 3: Test protected endpoints
    console.log('📋 Testing protected endpoints...');
    console.log();

    // Test patients endpoint
    await testEPDEndpoint(token, '/api/patients?page=1&limit=5');

    // Test encounters endpoint
    await testEPDEndpoint(token, '/api/encounters?page=1&limit=5');

    // Test allergies endpoint  
    await testEPDEndpoint(token, '/api/allergies?page=1&limit=5');

    console.log('='.repeat(50));
    console.log('✅ All Auth0 M2M tests passed!');
    console.log('='.repeat(50));
  } catch (error) {
    console.log('='.repeat(50));
    console.log('❌ Auth0 M2M test failed');
    console.log('='.repeat(50));
    process.exit(1);
  }
}

main();
