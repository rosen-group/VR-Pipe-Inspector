const https = require('node:https');
const pem = require('@metcoder95/https-pem');
const st = require('st');

const mount = st({ path: __dirname, url: '/' });

const server = https.createServer(pem, function (req, res) {
    const stHandled = mount(req, res);
    if (!stHandled) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
});

server.listen(443, function () {
    console.log('Open https://localhost/app/index.html in your browser!');
});