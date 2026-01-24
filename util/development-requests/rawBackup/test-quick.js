#!/usr/bin/env node
/**
 * Quick endpoint test script
 * Run with: node test-quick.js
 */

const http = require('http');
const https = require('https');

const results = [];

async function request(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https');
        const lib = isHttps ? https : http;
        
        const req = lib.request(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data,
                    headers: res.headers
                });
            });
        });
        
        req.on('error', (e) => resolve({ status: 0, error: e.message }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

async function testEndpoint(service, name, url, options = {}) {
    const start = Date.now();
    const result = await request(url, options);
    const time = Date.now() - start;
    
    const status = result.status >= 200 && result.status < 400 ? 'PASS' : 
                   result.status === 401 ? 'AUTH' : 
                   result.status === 403 ? 'FORBIDDEN' : 'FAIL';
    
    results.push({
        service,
        name,
        url,
        method: options.method || 'GET',
        status,
        statusCode: result.status,
        time,
        error: result.error,
        response: result.data ? result.data.substring(0, 200) : null
    });
    
    const emoji = status === 'PASS' ? '?' : status === 'AUTH' ? '??' : status === 'FORBIDDEN' ? '??' : '?';
    console.log(`${emoji} ${options.method || 'GET'} ${name} [${result.status}] (${time}ms)`);
    if (result.error) console.log(`   Error: ${result.error}`);
    
    return result;
}

async function main() {
    console.log('='.repeat(60));
    console.log('?? Quick Endpoint Test');
    console.log('='.repeat(60));
    
    // Test FastAPI Backend
    console.log('\n?? FastAPI Backend (Port 8000)');
    console.log('-'.repeat(40));
    
    await testEndpoint('FastAPI', 'Root', 'http://localhost:8000/api/');
    const authResult = await testEndpoint('FastAPI', 'Auth Login', 'http://localhost:8000/api/auth/login/', { method: 'POST' });
    
    let token = null;
    if (authResult.status === 200 && authResult.data) {
        try {
            token = JSON.parse(authResult.data).access_token;
            console.log('   ?? Token obtained');
        } catch (e) {}
    }
    
    const authHeaders = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : {};
    
    await testEndpoint('FastAPI', 'List Patients', 'http://localhost:8000/api/patient/', { headers: authHeaders });
    await testEndpoint('FastAPI', 'Get Patient 1', 'http://localhost:8000/api/patient/1', { headers: authHeaders });
    await testEndpoint('FastAPI', 'List Encounters', 'http://localhost:8000/api/encounters/', { headers: authHeaders });
    await testEndpoint('FastAPI', 'Get Encounter 1', 'http://localhost:8000/api/encounters/1', { headers: authHeaders });
    await testEndpoint('FastAPI', 'List Mails User 1', 'http://localhost:8000/api/mails/user/1', { headers: authHeaders });
    await testEndpoint('FastAPI', 'Mail Count User 1', 'http://localhost:8000/api/mails/user/1/count', { headers: authHeaders });
    
    // Test EPD Backend
    console.log('\n?? EPD Backend (Port 3001)');
    console.log('-'.repeat(40));
    
    await testEndpoint('EPD', 'Health', 'http://localhost:3001/health');
    await testEndpoint('EPD', 'List Users', 'http://localhost:3001/api/users', { headers: authHeaders });
    await testEndpoint('EPD', 'List Patients', 'http://localhost:3001/api/patients', { headers: authHeaders });
    await testEndpoint('EPD', 'Get Patient 1', 'http://localhost:3001/api/patients/1', { headers: authHeaders });
    await testEndpoint('EPD', 'List Encounters', 'http://localhost:3001/api/encounters', { headers: authHeaders });
    await testEndpoint('EPD', 'List Medications', 'http://localhost:3001/api/medications', { headers: authHeaders });
    await testEndpoint('EPD', 'List Allergies', 'http://localhost:3001/api/allergies', { headers: authHeaders });
    await testEndpoint('EPD', 'List Vitals', 'http://localhost:3001/api/vitals', { headers: authHeaders });
    await testEndpoint('EPD', 'List Lab Results', 'http://localhost:3001/api/lab-results', { headers: authHeaders });
    await testEndpoint('EPD', 'List Appointments', 'http://localhost:3001/api/appointments', { headers: authHeaders });
    await testEndpoint('EPD', 'List Insurers', 'http://localhost:3001/api/insurance/insurers', { headers: authHeaders });
    await testEndpoint('EPD', 'List Policies', 'http://localhost:3001/api/insurance/policies', { headers: authHeaders });
    
    // Test without auth to verify auth is required
    console.log('\n?? EPD Backend (No Auth - should fail)');
    console.log('-'.repeat(40));
    await testEndpoint('EPD-NoAuth', 'List Patients (no auth)', 'http://localhost:3001/api/patients');
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('?? SUMMARY');
    console.log('='.repeat(60));
    
    const byService = {};
    results.forEach(r => {
        if (!byService[r.service]) byService[r.service] = { pass: 0, fail: 0, auth: 0, forbidden: 0 };
        if (r.status === 'PASS') byService[r.service].pass++;
        else if (r.status === 'AUTH') byService[r.service].auth++;
        else if (r.status === 'FORBIDDEN') byService[r.service].forbidden++;
        else byService[r.service].fail++;
    });
    
    Object.entries(byService).forEach(([service, counts]) => {
        console.log(`\n${service}:`);
        console.log(`  ? Pass: ${counts.pass}`);
        console.log(`  ?? Auth Required: ${counts.auth}`);
        console.log(`  ?? Forbidden: ${counts.forbidden}`);
        console.log(`  ? Fail: ${counts.fail}`);
    });
    
    // Save results
    const fs = require('fs');
    fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
    console.log('\n?? Results saved to test-results.json');
}

main().catch(console.error);
