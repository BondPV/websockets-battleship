import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

export const httpServer = http.createServer(function (req, res) {
    const __dirname = path.resolve(path.dirname(''));
    const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);

    fs.readFile(file_path, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.end(JSON.stringify(error));
            return;
        }

        res.writeHead(200);
        res.end(data);
    });
});