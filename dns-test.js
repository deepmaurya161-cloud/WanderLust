const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

dns.promises
    .resolveSrv("_mongodb._tcp.cluster0.q6iwtgb.mongodb.net")
    .then(result => {
        console.log("DNS SUCCESS:");
        console.log(result);
    })
    .catch(err => {
        console.log("DNS FAILED:");
        console.log(err);
    });