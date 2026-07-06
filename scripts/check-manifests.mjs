#!/usr/bin/env node
// Manifest-integrity check: every path referenced by a manifest (pnpm
// workspace globs, docker-compose build contexts/dockerfiles, Dockerfile COPY
// sources) must resolve to a real file/dir in the tree. Fails the build if not.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const ROOT = process.cwd();
const errors = [];
const checks = [];

function ok(msg) {
  checks.push(msg);
}
function fail(msg) {
  errors.push(msg);
}

// --- pnpm-workspace.yaml: every glob must match >=1 package with package.json
function checkWorkspace() {
  const file = join(ROOT, "pnpm-workspace.yaml");
  if (!existsSync(file)) return fail("pnpm-workspace.yaml missing");
  const globs = readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*-\s*["']?([^"'#]+?)["']?\s*$/))
    .filter(Boolean)
    .map((m) => m[1].trim());
  for (const glob of globs) {
    const m = glob.match(/^(.+)\/\*$/);
    if (!m) {
      if (!existsSync(join(ROOT, glob)))
        fail(`workspace glob '${glob}' resolves to nothing`);
      continue;
    }
    const base = join(ROOT, m[1]);
    if (!existsSync(base)) {
      fail(`workspace glob '${glob}' base dir missing`);
      continue;
    }
    const members = readdirSync(base).filter((d) =>
      statSync(join(base, d)).isDirectory(),
    );
    if (members.length === 0) fail(`workspace glob '${glob}' matched no dirs`);
    for (const member of members) {
      const pkg = join(base, member, "package.json");
      if (!existsSync(pkg))
        fail(`workspace member '${m[1]}/${member}' has no package.json`);
      else ok(`workspace member ${m[1]}/${member}`);
    }
  }
}

// --- docker-compose.yml: build contexts + dockerfiles exist
function checkCompose() {
  const file = join(ROOT, "docker-compose.yml");
  if (!existsSync(file)) return fail("docker-compose.yml missing");
  const text = readFileSync(file, "utf8");
  const contexts = [...text.matchAll(/context:\s*(\S+)/g)].map((m) => m[1]);
  const dockerfiles = [...text.matchAll(/dockerfile:\s*(\S+)/g)].map(
    (m) => m[1],
  );
  for (const ctx of contexts) {
    if (!existsSync(resolve(ROOT, ctx)))
      fail(`compose build context '${ctx}' does not exist`);
    else ok(`compose context ${ctx}`);
  }
  for (const df of dockerfiles) {
    if (!existsSync(resolve(ROOT, df)))
      fail(`compose dockerfile '${df}' does not exist`);
    else {
      ok(`compose dockerfile ${df}`);
      checkDockerfileCopies(resolve(ROOT, df), ROOT);
    }
  }
}

// --- Dockerfile COPY sources (build context = repo root here)
function checkDockerfileCopies(dockerfilePath, context) {
  const lines = readFileSync(dockerfilePath, "utf8").split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!/^COPY\b/i.test(line)) continue;
    if (/--from=/i.test(line)) continue; // stage copies, not tree paths
    const parts = line
      .replace(/^COPY\s+/i, "")
      .split(/\s+/)
      .filter((p) => !p.startsWith("--"));
    const sources = parts.slice(0, -1); // last token is the destination
    for (const src of sources) {
      if (src.includes("*") || src === "." || src === "./") continue;
      if (!existsSync(resolve(context, src)))
        fail(`Dockerfile COPY source '${src}' missing (${dockerfilePath})`);
      else ok(`Dockerfile COPY ${src}`);
    }
  }
}

checkWorkspace();
checkCompose();

console.log(`[manifest-check] ${checks.length} references verified`);
if (errors.length > 0) {
  console.error(`[manifest-check] ${errors.length} problem(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("[manifest-check] OK — every referenced path exists");
