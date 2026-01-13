#!/usr/bin/env node
/**
 * Final comprehensive test with valid IDs
 */

const http = require('http');
const https = require('https');

let globalToken = null;

async function request(url, options = {}) {
    return new Promise((resolve) => {
        const isHttps = url.startsWith('https');
        const lib = isHttps ? https : http;
        const urlObj = new URL(url);
        
        const req = lib.request({
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: { 'Content-Type': 'application/json', ...options.headers },
            timeout: 10000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let json = null;
                try { json = JSON.parse(data); } catch(e) {}
                resolve({ status: res.statusCode, data, json });
            });
        });
        
        req.on('error', (e) => resolve({ status: 0, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
        if (options.body) req.write(JSON.stringify(options.body));
        req.end();
    });
}

async function test(name, url, method = 'GET') {
    const headers = globalToken ? { 'Authorization': `Bearer ${globalToken}` } : {};
    const start = Date.now();
    const result = await request(url, { method, headers });
    const time = Date.now() - start;
    
    const emoji = result.status >= 200 && result.status < 300 ? '?' : 
                  result.status === 404 ? '??' : 
                  result.status === 401 ? '??' : 
                  result.status === 403 ? '??' : '?';
    
    console.log(`${emoji} ${method.padEnd(6)} ${name.padEnd(40)} [${result.status}] (${time}ms)`);
    return result;
}

async function main() {
    console.log('='.repeat(70));
    console.log('?? FINAL COMPREHENSIVE API TEST');
    console.log('='.repeat(70));
    
    // Get token
    console.log('\n--- Authentication ---');
    const authResult = await test('Get Token', 'http://localhost:8000/api/auth/login/', 'POST');
    if (authResult.json?.access_token) {
        globalToken = authResult.json.access_token;
        console.log('   ?? Token obtained');
    }
    
    // Get valid IDs from EPD
    console.log('\n--- Getting Valid IDs from EPD ---');
    const patientsResult = await test('EPD: List Patients', 'http://localhost:3001/api/patients?limit=1');
    let patientId = patientsResult.json?.patients?.[0]?.id;
    console.log(`   ?? Valid Patient ID: ${patientId || 'N/A'}`);
    
    const encountersResult = await test('EPD: List Encounters', 'http://localhost:3001/api/encounters?limit=1');
    let encounterId = encountersResult.json?.encounters?.[0]?.id;
    console.log(`   ?? Valid Encounter ID: ${encounterId || 'N/A'}`);
    
    // Test FastAPI with valid IDs
    console.log('\n--- FastAPI Backend Tests ---');
    await test('Root Health', 'http://localhost:8000/api/');
    await test('List Patients', 'http://localhost:8000/api/patient/');
    await test('List Patients (paginated)', 'http://localhost:8000/api/patient/?limit=5&offset=0');
    if (patientId) {
        await test(`Get Patient ${patientId}`, `http://localhost:8000/api/patient/${patientId}`);
    }
    await test('List Encounters', 'http://localhost:8000/api/encounters/');
    if (encounterId) {
        await test(`Get Encounter ${encounterId}`, `http://localhost:8000/api/encounters/${encounterId}`);
    }
    await test('Get User Mails', 'http://localhost:8000/api/mails/user/1');
    await test('Get Mail Count', 'http://localhost:8000/api/mails/user/1/count');
    
    // Test EPD directly
    console.log('\n--- EPD Backend Tests ---');
    await test('Health', 'http://localhost:3001/health');
    await test('List Patients', 'http://localhost:3001/api/patients');
    if (patientId) {
        await test(`Get Patient ${patientId}`, `http://localhost:3001/api/patients/${patientId}`);
    }
    await test('List Encounters', 'http://localhost:3001/api/encounters');
    await test('List Medications', 'http://localhost:3001/api/medications');
    await test('List Allergies', 'http://localhost:3001/api/allergies');
    await test('List Vitals', 'http://localhost:3001/api/vitals');
    await test('List Lab Results', 'http://localhost:3001/api/lab-results');
    await test('List Appointments', 'http://localhost:3001/api/appointments');
    await test('List Insurers', 'http://localhost:3001/api/insurance/insurers');
    await test('List Policies', 'http://localhost:3001/api/insurance/policies');
    await test('List Medical Records', 'http://localhost:3001/api/medical-records');
    await test('List Diagnoses', 'http://localhost:3001/api/diagnoses');
    
    console.log('\n' + '='.repeat(70));
    console.log('? Test Complete!');
    console.log('='.repeat(70));
}

main().catch(console.error);
