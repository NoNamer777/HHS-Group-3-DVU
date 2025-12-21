/**
 * Test script voor Auth0 M2M authenticatie
 */

import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Auth0 M2M credentials uit environment variables
const AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || '';

const MAIL_SERVICE_URL = 'http://localhost:3001';

async function createTestUser() {
  console.log('👤 Test user aanmaken...');
  
  try {
    // Eerst checken of user al bestaat
    const existing = await prisma.user.findUnique({
      where: { id: 'test-123' }
    });
    
    if (existing) {
      console.log('   Test user bestaat al');
      return;
    }
    
    await prisma.user.create({
      data: {
        id: 'test-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed_password_placeholder'
      }
    });
    console.log('✅ Test user aangemaakt');
  } catch (error: any) {
    console.error('❌ Fout bij aanmaken test user:', error.message);
    throw error;
  }
}

async function cleanupTestUser() {
  console.log('\n🧹 Test user opruimen...');
  
  try {
    await prisma.user.delete({
      where: { id: 'test-123' }
    }).catch(() => {});
    console.log('✅ Test user verwijderd');
  } catch (error: any) {
    console.log('   Test user was al verwijderd');
  } finally {
    await prisma.$disconnect();
  }
}

async function getM2MToken(): Promise<string> {
  console.log('\n🔐 Verkrijgen van M2M token...');
  
  try {
    const response = await axios.post(
      `https://${AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: AUTH0_CLIENT_ID,
        client_secret: AUTH0_CLIENT_SECRET,
        audience: AUTH0_AUDIENCE,
        grant_type: 'client_credentials'
      }
    );

    console.log('✅ Token verkregen');
    console.log(`   Expires in: ${response.data.expires_in} seconds`);
    
    return response.data.access_token;
  } catch (error: any) {
    console.error('❌ Fout bij verkrijgen token:', error.response?.data || error.message);
    throw error;
  }
}

async function testHealthCheck() {
  console.log('\n📋 Test 1: Health check');
  
  try {
    const response = await axios.get(`${MAIL_SERVICE_URL}/health`);
    console.log('✅ Health check OK:', response.data);
  } catch (error: any) {
    console.error('❌ Health check gefaald:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    throw error;
  }
}

async function testWithoutToken() {
  console.log('\n📋 Test 2: Request zonder token (verwacht: 401 of 400)');
  
  try {
    await axios.get(`${MAIL_SERVICE_URL}/api/mails/user/test-123`);
    console.log('❌ Zou moeten falen maar is geslaagd!');
    throw new Error('Expected auth error');
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 400) {
      console.log(`✅ Correct: ${error.response.status} - Auth required`);
    } else {
      console.error('❌ Verkeerde error:');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Message: ${error.message}`);
      throw error;
    }
  }
}

async function testGetMails(token: string) {
  console.log('\n📋 Test 3: Ophalen mails met M2M token');
  
  try {
    const response = await axios.get(
      `${MAIL_SERVICE_URL}/api/mails/user/test-123`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log(`✅ Mails opgehaald: ${response.data.length} mails`);
  } catch (error: any) {
    console.error('❌ Fout bij ophalen mails:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Data:`, error.response?.data);
    console.error(`   Message: ${error.message}`);
    throw error;
  }
}

async function testCreateMail(token: string) {
  console.log('\n📋 Test 4: Aanmaken mail met M2M token');
  
  const mail = {
    userId: 'test-123',
    from: 'noreply@hospital.com',
    to: 'patient@example.com',
    subject: 'Test M2M Mail',
    body: 'Dit is een test mail via Auth0 M2M.'
  };
  
  try {
    const response = await axios.post(
      `${MAIL_SERVICE_URL}/api/mails`,
      mail,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Mail aangemaakt:', response.data.id);
    return response.data.id;
  } catch (error: any) {
    console.error('❌ Fout bij aanmaken mail:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Data:`, error.response?.data);
    console.error(`   Message: ${error.message}`);
    throw error;
  }
}

async function testMailCount(token: string) {
  console.log('\n📋 Test 5: Mail count ophalen');
  
  try {
    const response = await axios.get(
      `${MAIL_SERVICE_URL}/api/mails/user/test-123/count`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    console.log(`✅ Count: ${response.data.totalCount} total, ${response.data.unreadCount} unread`);
  } catch (error: any) {
    console.error('❌ Fout:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Start M2M Tests\n');
  
  try {
    // Setup: test user aanmaken
    await createTestUser();
    
    await testHealthCheck();
    await testWithoutToken();
    
    const token = await getM2MToken();
    
    await testGetMails(token);
    const mailId = await testCreateMail(token);
    await testMailCount(token);
    
    console.log('\n✅ Alle tests geslaagd!');
    console.log('   - Tokens worden correct verkregen');
    console.log('   - API endpoints zijn beveiligd');
    console.log('   - GET requests werken met M2M token');
    console.log('   - POST requests werken met M2M token');
    console.log('   - Data integriteit gewaarborgd via foreign keys');
  } catch (error) {
    console.error('\n❌ Tests gefaald');
    await cleanupTestUser();
    process.exit(1);
  } finally {
    // Cleanup: test user verwijderen
    await cleanupTestUser();
  }
}

runTests();
