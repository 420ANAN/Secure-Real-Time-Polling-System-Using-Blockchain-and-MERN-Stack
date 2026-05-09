const dns = require('dns');

dns.setServers(['8.8.8.8']); // use google dns

dns.resolveSrv('_mongodb._tcp.pollingsystem.1kxmx48.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('SRV Error:', err);
    return;
  }
  console.log('SRV Addresses:', addresses);

  addresses.forEach(addr => {
    dns.resolveTxt(addr.name, (err, txts) => {
      if (err) {
        console.error('TXT Error for', addr.name, ':', err);
      } else {
        console.log('TXT for', addr.name, ':', txts);
      }
    });
  });
});
