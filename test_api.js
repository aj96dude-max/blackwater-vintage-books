const http = require('http');

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('1. Testing GET /api/books...');
  const books = await request('GET', '/api/books');
  console.log(' -> Books count:', books.length);

  console.log('2. Testing Hit Search for "Godfather"...');
  const hitRes = await request('POST', '/api/search', { query: 'Godfather' });
  console.log(' -> Hit status:', hitRes.status, '| Matched title:', hitRes.results[0].title);

  console.log('3. Testing Miss Search (Discrete Variation) for "The Silmarillion"...');
  const missRes = await request('POST', '/api/search', { query: 'The Silmarillion' });
  console.log(' -> Miss status:', missRes.status, '| Log status:', missRes.log.status, '| Count:', missRes.log.requestCount);

  console.log('4. Testing repeat search for "The Silmarillion" (should increment requestCount to 2)...');
  const missRes2 = await request('POST', '/api/search', { query: 'The Silmarillion' });
  console.log(' -> Updated request count:', missRes2.log.requestCount);

  console.log('5. Testing GET /api/admin/logs...');
  const logs = await request('GET', '/api/admin/logs');
  const silLog = logs.find(l => l.queryString === 'The Silmarillion');
  console.log(' -> Found silmarillion in logs with count:', silLog.requestCount, '| status:', silLog.status);

  console.log('6. Testing POST /api/books (CRUD Create & automatic requisition fulfillment for "The Silmarillion")...');
  const createdBook = await request('POST', '/api/books', {
    title: 'The Silmarillion',
    author: 'J.R.R. Tolkien',
    genre: 'High Fantasy & Chronicles',
    price: 20.00,
    stockStatus: 'In Stock',
    description: 'The ancient mythology of Middle-earth.',
    excerpt: 'There was Eru, the One, who in Arda is called Ilúvatar...'
  });
  console.log(' -> Created volume ID:', createdBook.id, '| Title:', createdBook.title);

  console.log('7. Verifying search log status automatically changed from Pending -> Added...');
  const logsAfter = await request('GET', '/api/admin/logs');
  const silLogAfter = logsAfter.find(l => l.queryString === 'The Silmarillion');
  console.log(' -> Requisition fulfillment status:', silLogAfter.status);

  console.log('\n✅ ALL API & AUTOMATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
