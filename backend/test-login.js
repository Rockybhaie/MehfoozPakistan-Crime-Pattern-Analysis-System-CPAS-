// Quick test to check login API
const http = require('http');

const postData = JSON.stringify({
  email: 'ali.khan@cpas.gov.pk',
  password: 'changeme123'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/officer/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE:', data);
    try {
      const json = JSON.parse(data);
      console.log('PARSED:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Not JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
});

req.write(postData);
req.end();
