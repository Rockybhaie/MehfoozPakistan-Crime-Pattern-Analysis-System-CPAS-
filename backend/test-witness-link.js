/**
 * Test script to verify witness linking functionality
 * Run: node test-witness-link.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3001/api';

function apiCall(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${endpoint}`);
    const reqOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ ok: res.statusCode < 400, status: res.statusCode, data: json });
        } catch (e) {
          resolve({ ok: false, status: res.statusCode, data: { message: data } });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function testWitnessLink() {
  console.log('🔐 Testing Witness Link Functionality...\n');

  // Step 1: Login as officer
  console.log('Step 1: Logging in as officer...');
  const loginResponse = await apiCall('/auth/officer/login', {
    method: 'POST',
    body: {
      email: 'ali.khan@cpas.gov.pk',
      password: 'changeme123'
    }
  });

  if (!loginResponse.data.token) {
    console.error('❌ Login failed:', loginResponse.data);
    return;
  }
  console.log('✅ Login successful! Token:', loginResponse.data.token.substring(0, 20) + '...\n');

  const token = loginResponse.data.token;

  // Step 2: Try to link witness to crime
  console.log('Step 2: Linking witness #2 to crime #1 (witness #1 is already linked)...');
  const requestBody = {
    witnessId: 2,
    statementDate: new Date().toISOString().split('T')[0],
    statementText: 'Test witness statement from script',
    isKeyWitness: true
  };
  console.log('Request body:', requestBody);
  
  const linkResponse = await apiCall('/crimes/1/witnesses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: requestBody
  });

  console.log('Link Response Status:', linkResponse.status);
  console.log('Link Response:', linkResponse.data);

  if (linkResponse.ok) {
    console.log('✅ Witness linked successfully!\n');

    // Step 3: Verify by getting crime details
    console.log('Step 3: Verifying witness appears in crime details...');
    const crimeResponse = await apiCall('/crimes/1', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Crime Witnesses:', crimeResponse.data.witnesses);
    console.log('\n✅ Test completed successfully!');
  } else {
    console.error('❌ Failed to link witness:', linkResponse.data);
  }
}

testWitnessLink().catch(err => {
  console.error('❌ Test failed with error:', err.message);
});
