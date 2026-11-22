const tls = require('tls');
const https = require('https');

// Test 1: general TLS via HTTPS to google
https.get('https://www.google.com', res => {
  console.log('HTTPS to google.com:', res.statusCode, '(TLS works generally)');
  res.resume();
  runMongoTLS();
}).on('error', e => {
  console.error('HTTPS to google.com FAILED:', e.code, e.message);
  runMongoTLS();
});

// Test 2: TLS handshake directly with MongoDB host
function runMongoTLS() {
  const host = 'ac-l0xqxes-shard-00-00.lim6iy0.mongodb.net';
  const sock = tls.connect({ host, port: 27017, servername: host, timeout: 10000 }, () => {
    console.log('TLS handshake with MongoDB host: SUCCESS');
    sock.destroy();
  });
  sock.on('error', e => {
    console.error('TLS handshake with MongoDB host FAILED:', e.code, '-', e.message);
  });
  sock.on('timeout', () => {
    console.error('TLS handshake with MongoDB host: TIMEOUT');
    sock.destroy();
  });
}
