import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dashboardData from "./api/dashboard-data.js";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const preferredPort = parsePort(process.env.PORT, 3000);
const portScanLimit = parsePort(process.env.PORT_SCAN_LIMIT, 100);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function loadEnvLocal() {
  const envPath = resolve(rootDir, ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function parsePort(value, fallback) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : fallback;
}

function isKnownDeadLocalProxy(value) {
  if (!value) return false;

  try {
    const proxy = new URL(value);
    const hostname = proxy.hostname.toLowerCase();
    return proxy.port === "9" && ["127.0.0.1", "localhost", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

function ignoreKnownDeadProxyEnv() {
  const proxyEnvNames = [
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "ALL_PROXY",
    "GIT_HTTP_PROXY",
    "GIT_HTTPS_PROXY",
    "http_proxy",
    "https_proxy",
    "all_proxy",
  ];

  const cleared = proxyEnvNames.filter((name) => {
    if (!isKnownDeadLocalProxy(process.env[name])) return false;
    delete process.env[name];
    return true;
  });

  if (cleared.length) {
    console.warn(`Ignoring local dead proxy env for dev server: ${cleared.join(", ")}`);
  }
}

function attachJsonHelpers(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    if (!res.hasHeader("Content-Type")) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
    res.end(JSON.stringify(payload));
    return res;
  };
  return res;
}

function isInsideRoot(pathname) {
  const normalizedRoot = rootDir.toLowerCase();
  const normalizedPath = pathname.toLowerCase();
  return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}\\`);
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = resolve(rootDir, `.${relativePath}`);

  if (!isInsideRoot(filePath)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

async function handleRequest(req, res) {
  try {
    if ((req.url || "").startsWith("/api/dashboard-data")) {
      await dashboardData(req, attachJsonHelpers(res));
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: message }));
  }
}

function startServer(port) {
  const server = createServer(handleRequest);
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < preferredPort + portScanLimit) {
      console.warn(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
      return;
    }

    console.error(error.message);
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(`Legacy KPI dashboard: http://localhost:${port}`);
  });
}

loadEnvLocal();
ignoreKnownDeadProxyEnv();
startServer(preferredPort);
