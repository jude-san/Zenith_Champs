const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { URL } = require("node:url");
const { parse } = require("node:querystring");

const dbPath = path.join(__dirname, "data", "db.json");
const publicPath = path.join(__dirname, "public");

function ensureDatabaseFile() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    const seed = {
      members: [
        {
          id: "1",
          name: "DevOps",
          role: "Member",
          avatar: "⚙️",
        },
      ],
      tasks: [
        {
          id: "task-1",
          title: "Deploy cloud database",
          suggestedOptions: ["Supabase", "Firebase"],
          checklist: [
            "Create tables",
            "Seed provider data",
            "Connect API (Use Interswitch's Resources)",
            "Ensure backend redeploy after schema update",
            "Update environment variables if needed",
            "Test API connectivity for payment endpoint",
            "Monitor logs during payment flow testing",
          ],
          acceptanceCriteria: "Backend connected to live database.",
          tags: ["DevOps"],
          comments: [],
        },
      ],
      notes: {
        interswitchUse:
          "Use Interswitch for payment collection endpoints and transaction status verification in the backend API.",
        freeHosting: {
          frontend: ["Netlify", "Vercel", "Cloudflare Pages"],
          backend: ["Render (free tier)", "Railway trial", "Fly.io free allowance"],
          database: ["Supabase free tier", "Firebase Spark plan"],
        },
      },
    };

    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2));
  }
}

function readDb() {
  ensureDatabaseFile();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sendFile(res, fileName, contentType) {
  const filePath = path.join(publicPath, fileName);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": contentType });
  res.end(fs.readFileSync(filePath));
}

function collectBody(req, callback) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => callback(body));
}

function createServer() {
  ensureDatabaseFile();
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/api/state") {
      sendJson(res, 200, readDb());
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/comments") {
      collectBody(req, (rawBody) => {
        const contentType = req.headers["content-type"] || "";
        let body = {};

        if (contentType.includes("application/json")) {
          try {
            body = JSON.parse(rawBody || "{}");
          } catch (_error) {
            sendJson(res, 400, { error: "Invalid JSON body." });
            return;
          }
        } else {
          body = parse(rawBody);
        }

        const text = typeof body.text === "string" ? body.text.trim() : "";
        if (!text) {
          sendJson(res, 400, { error: "Comment text is required." });
          return;
        }

        const db = readDb();
        const task = db.tasks[0];
        const newComment = {
          id: String(Date.now()),
          text,
          author: "Member",
          createdAt: new Date().toISOString(),
        };
        task.comments.push(newComment);
        writeDb(db);

        sendJson(res, 201, { comment: newComment });
      });
      return;
    }

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      sendFile(res, "index.html", "text/html; charset=utf-8");
      return;
    }

    if (req.method === "GET" && url.pathname === "/styles.css") {
      sendFile(res, "styles.css", "text/css; charset=utf-8");
      return;
    }

    if (req.method === "GET" && url.pathname === "/app.js") {
      sendFile(res, "app.js", "application/javascript; charset=utf-8");
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  });
}

module.exports = { createServer, ensureDatabaseFile, readDb };

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    process.stdout.write(`Server running at http://localhost:${port}\n`);
  });
}
