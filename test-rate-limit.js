/**
 * Rate Limit Test Script
 * Run: node test-rate-limit.js [URL]
 * Example: node test-rate-limit.js https://forum-api-production-2e8e.up.railway.app
 */

const baseUrl = process.argv[2] || 'http://localhost:5000';

async function testRateLimit() {
  console.log(`Testing rate limit on: ${baseUrl}/threads/test-thread-id`);
  console.log('Sending 100 requests...\n');
  
  let successCount = 0;
  let rateLimitedCount = 0;
  let errorCount = 0;
  
  const promises = [];
  
  for (let i = 0; i < 100; i++) {
    promises.push(
      fetch(`${baseUrl}/threads/thread-123`)
        .then(res => {
          if (res.status === 429) {
            rateLimitedCount++;
            return { status: 429, headers: Object.fromEntries(res.headers) };
          }
          successCount++;
          return { status: res.status };
        })
        .catch(err => {
          errorCount++;
          return { error: err.message };
        })
    );
  }
  
  const results = await Promise.all(promises);
  
  console.log('Results:');
  console.log(`  ✅ Success (non-429): ${successCount}`);
  console.log(`  🚫 Rate Limited (429): ${rateLimitedCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  
  if (rateLimitedCount > 0) {
    console.log('\n✅ Rate limiting is WORKING!');
    const limited = results.find(r => r.status === 429);
    if (limited && limited.headers) {
      console.log('\nRate limit headers:');
      console.log(`  Retry-After: ${limited.headers['retry-after']}`);
      console.log(`  X-RateLimit-Limit: ${limited.headers['x-ratelimit-limit']}`);
      console.log(`  X-RateLimit-Remaining: ${limited.headers['x-ratelimit-remaining']}`);
    }
  } else {
    console.log('\n⚠️ Rate limiting NOT triggered (all requests succeeded)');
    console.log('   This is expected if limit is 90/min and you sent 100 quickly');
  }
}

testRateLimit().catch(console.error);


