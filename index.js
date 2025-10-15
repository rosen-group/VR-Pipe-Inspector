const https = require('node:https');
const pem = require('@metcoder95/https-pem');
const fs = require('fs');
const path = require('path');

const server = https.createServer(pem, function (req, res) {
    const filePath = path.join(__dirname, '.', req.url);

    fs.stat(filePath, (err, stats) => {
        if (err) {
            res.statusCode = 404;
            res.end("404 Not Found");
            return;
        }

        if (stats.isFile()) {
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.statusCode = 500;
                    res.end("Internal Server Error");
                    return;
                }
                if (req.url.endsWith('.js'))
                {
                    res.setHeader('Content-Type', 'application/javascript');
                }
                else
                {
                    res.setHeader('Content-Type', 'text/html');
                }

                res.end(content);
            });
        } else {
            res.statusCode = 403;
            res.end("403 Forbidden");
        }
    });
});

server.listen(443, function () {
    console.log('Open https://localhost/app/index.html in your browser!');
});