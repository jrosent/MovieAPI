// Access http://localhost:8080/index.html
require('dotenv').config();

const fs = require('fs');
const http = require('http');
const url = require('url');
const ROOT_DIR = "./";
const PORT = process.env.PORT;
const API_COOKIE = 'apikey=' + process.env.API_KEY;

http.createServer(function (req, res) {
    let urlObj = url.parse(req.url, true, false);
    if (req.method == "GET") {
        fs.readFile(ROOT_DIR + urlObj.pathname, function (err,data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',
                'Set-Cookie': API_COOKIE
            });
            res.end(data);
        });
    } else {  // POST - presume an AJAX request and echo payload back
        var reqContent = "";
        req.on('data', function (chunk) {
            reqContent += chunk;
        });
        req.on('end', function (chunk) {
            res.writeHead(200);
            res.end(reqContent);
        });
    }
}).listen(PORT, 'localhost',3 , function() {
    console.log('I am now ready!');
});