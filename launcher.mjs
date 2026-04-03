import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { existsSync, createReadStream, statSync, rmSync } from "node:fs";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(projectDir, "dist");
const port = 4173;
const baseUrl = `http://localhost:${port}`;
const logPrefix = "[launcher]";

let server;
let browserProcess;
let browserProfileDir;
let shuttingDown = false;

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectDir,
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getNpmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function ensureDependencies() {
  if (!existsSync(path.join(projectDir, "node_modules"))) {
    console.log(`${logPrefix} node_modules가 없어 npm install을 실행합니다...`);
    runCommand(getNpmCommand(), ["install"]);
  }
}

function buildApp() {
  console.log(`${logPrefix} 정적 파일을 빌드합니다...`);
  runCommand(getNpmCommand(), ["run", "build"]);
}

function getChromeCandidates() {
  if (process.platform === "darwin") {
    return [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Chromium.app/Contents/MacOS/Chromium"
    ];
  }

  if (process.platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA ?? "";
    const programFiles = process.env.PROGRAMFILES ?? "C:\\Program Files";
    const programFilesX86 = process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)";

    return [
      path.join(programFiles, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(programFiles, "Chromium", "Application", "chrome.exe")
    ];
  }

  return [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium"
  ];
}

async function findChromeExecutable() {
  for (const candidate of getChromeCandidates()) {
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

async function resolveFile(urlPath) {
  const safePath = decodeURIComponent(urlPath.split("?")[0]);
  const targetPath = safePath === "/" ? "/index.html" : safePath;
  const candidate = path.normalize(path.join(distDir, targetPath));

  if (!candidate.startsWith(distDir)) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  const fallback = path.join(distDir, "index.html");
  return existsSync(fallback) ? fallback : null;
}

async function startServer() {
  server = createServer(async (req, res) => {
    try {
      const filePath = await resolveFile(req.url ?? "/");

      if (!filePath) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, { "Content-Type": getContentType(filePath) });
      createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(500);
      res.end("Server error");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => resolve());
  });
}

async function openChrome() {
  const chromeExecutable = await findChromeExecutable();

  if (!chromeExecutable) {
    throw new Error("Chrome executable not found");
  }

  browserProfileDir = await fs.mkdtemp(path.join(os.tmpdir(), "interactive-study-web-"));

  const args = [
    `--user-data-dir=${browserProfileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    `--app=${baseUrl}`,
    "--new-window"
  ];

  browserProcess = spawn(chromeExecutable, args, {
    cwd: projectDir,
    stdio: "ignore",
    detached: false
  });

  browserProcess.on("exit", () => {
    shutdown(0);
  });
}

async function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  if (browserProcess && !browserProcess.killed) {
    try {
      browserProcess.kill();
    } catch {}
  }

  if (server) {
    await new Promise((resolve) => {
      server.close(() => resolve());
    });
  }

  if (browserProfileDir) {
    try {
      rmSync(browserProfileDir, { recursive: true, force: true });
    } catch {}
  }

  process.exit(code);
}

function registerSignals() {
  process.on("SIGINT", () => shutdown(0));
  process.on("SIGTERM", () => shutdown(0));
  process.on("uncaughtException", (error) => {
    console.error(`${logPrefix} ${error.message}`);
    shutdown(1);
  });
}

async function main() {
  registerSignals();
  ensureDependencies();
  buildApp();
  await startServer();
  console.log(`${logPrefix} 로컬 서버 시작: ${baseUrl}`);
  await openChrome();
  console.log(`${logPrefix} Chrome 앱 창이 닫히면 서버도 종료됩니다.`);
}

main().catch((error) => {
  console.error(`${logPrefix} ${error.message}`);
  process.exit(1);
});
