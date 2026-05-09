const dns = require('dns');
const host = 'pollingsystem.1kxmx48.mongodb.net';

dns.resolveSrv('_mongodb._tcp.' + host, (err, addresses) => {
  if (err) {
    console.error('DNS SRV lookup failed:', err);
  } else {
    console.log('DNS SRV lookup addresses:', addresses);
  }
});

dns.lookup(host, (err, address, family) => {
  if (err) {
    console.error('DNS lookup failed:', err);
  } else {
    console.log('DNS lookup address:', address);
  }
});
