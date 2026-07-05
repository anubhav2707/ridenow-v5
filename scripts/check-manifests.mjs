#!/usr/bin/env node
// Manifest-integrity check (acceptance criterion): every path referenced by a
// manifest in the repo — pnpm-workspace.yaml, turbo.json, docker-compose.yml,
// fly.toml and every apps/*/Dockerfile — must resolve to a real file/dir in the
// tree. Dependency-free so it runs on a bare Node with no install.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
let checkedCount = 0;

// Gitignored templates that are intentionally absent from a fresh clone.
const isOptional = (p) => p === ".env" || p.startsWith(".env.");

function exists(relPath) {
  return existsSync(resolve(ROOT, relPath));
}

function check(manifest, relPath, note) {
  if (isOptional(relPath)) return;
  checkedCount++;
  if (!exists(relPath)) {
    problems.push(`${manifest}: references "${relPath}" (${note}) which does not exist`);
  }
}

function unquote(value) {
  return value
    .trim()
    .replace(/\s+#.*$/, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function checkWorkspace(rel) {
  if (!exists(rel)) return;
  const text = readFileSync(resolve(ROOT, rel), "utf8");
  for (const raw of text.split("\n")) {
    const m = /^\s*-\s*(.+)$/.exec(raw);
    if (!m) continue;
    const glob = unquote(m[1]);
    if (!glob) continue;
    const star = /^(.+)\/\*$/.exec(glob);
    if (star) {
      const abs = resolve(ROOT, star[1]);
      const matches = existsSync(abs)
        ? readdirSync(abs).filter(
            (e) =>
              statSync(join(abs, e)).isDirectory() && existsSync(join(abs, e, "package.json")),
          )
        : [];
      checkedCount++;
      if (matches.length === 0) {
        problems.push(`${rel}: workspace glob "${glob}" matches no package`);
      }
    } else {
      check(rel, glob, "workspace package");
    }
  }
}

function checkTurbo(rel) {
  if (!exists(rel)) return;
  const json = JSON.parse(readFileSync(resolve(ROOT, rel), "utf8"));
  for (const dep of json.globalDependencies ?? []) {
    if (dep.includes("*")) continue;
    check(rel, dep, "turbo globalDependency");
  }
}

function checkCompose(rel) {
  if (!exists(rel)) return;
  const text = readFileSync(resolve(ROOT, rel), "utf8");
  for (const raw of text.split("\n")) {
    let m;
    if ((m = /^\s*context:\s*(.+)$/.exec(raw))) check(rel, unquote(m[1]), "compose build context");
    else if ((m = /^\s*dockerfile:\s*(.+)$/.exec(raw))) check(rel, unquote(m[1]), "compose dockerfile");
    else if ((m = /^\s*env_file:\s*(.+)$/.exec(raw))) check(rel, unquote(m[1]), "compose env_file");
  }
}

function checkFly(rel) {
  if (!exists(rel)) return;
  const text = readFileSync(resolve(ROOT, rel), "utf8");
  const m = /dockerfile\s*=\s*"([^"]+)"/.exec(text);
  if (m) check(rel, m[1], "fly build dockerfile");
}

function checkDockerfile(rel) {
  if (!exists(rel)) return;
  const text = readFileSync(resolve(ROOT, rel), "utf8");
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const m = /^(COPY|ADD)\s+(.+)$/i.exec(line);
    if (!m) continue;
    const tokens = m[2].split(/\s+/).filter((t) => !t.startsWith("--"));
    if (tokens.length < 2) continue;
    const sources = tokens.slice(0, -1); // last token is the destination
    for (const src of sources) {
      if (/^https?:\/\//.test(src) || src.includes("*")) continue;
      check(rel, src, "Dockerfile COPY/ADD source");
    }
  }
}

function discoverDockerfiles() {
  const appsDir = resolve(ROOT, "apps");
  if (!existsSync(appsDir)) return [];
  return readdirSync(appsDir)
    .map((app) => join("apps", app, "Dockerfile"))
    .filter((p) => exists(p));
}

checkWorkspace("pnpm-workspace.yaml");
checkTurbo("turbo.json");
checkCompose("docker-compose.yml");
checkFly("fly.toml");
for (const df of discoverDockerfiles()) checkDockerfile(df);

if (problems.length > 0) {
  console.error(`✗ manifest-integrity check FAILED (${problems.length} problem(s)):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(`✓ manifest-integrity OK — ${checkedCount} referenced path(s) all exist.`);
