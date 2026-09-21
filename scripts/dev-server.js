#!/usr/bin/env node
/**
 * scripts/dev-server.js — zero-dependency static file server for local
 * preview of the built site (./_site). Usage: node scripts/dev-server.js
 * [directory] [port]. No external packages required.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const dir = path.resolve(process.argv[2] || "_site");
const port = parseInt(process.argv[3] || "5050", 10);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8"
};

if (!fs.existsSync(dir)) {
  console.error("No existe el directorio " + dir + ". Corre `npm run build` primero.");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  let filePath = path.join(dir, urlPath);

  if (!filePath.startsWith(dir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, "index.html");

    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        const notFound = path.join(dir, "404.html");
        fs.readFile(notFound, (err3, data404) => {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(err3 ? "404 Not Found" : data404);
        });
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log("Sirviendo " + dir + " en http://localhost:" + port);
});
