import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  renameSync,
  statSync,
  unlinkSync,
} from "fs";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const BASE = process.env.PSEUDO_BASE || "https://rgw.cscs.ch/matcloud:mc-discover-sssp-public/v2.0";
const OUT = process.env.PSEUDO_DIR || resolve(dirname(fileURLToPath(import.meta.url)), "../public/pseudo");
const CONCURRENCY = Number(process.env.PSEUDO_CONCURRENCY || 8);
const RETRIES = Number(process.env.PSEUDO_RETRIES || 3);

const SYMBOLS =
  "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(/\s+/);

const TARBALLS = ["eff_pbe", "eff_pbesol", "prec_pbe", "prec_pbesol"];

let downloads = 0;
let skipped = 0;
let failed = 0;
const failures = [];

const ok = (res) => res.ok || res.status === 200;

function writeStream(raw) {
  return Readable.fromWeb(raw);
}

async function save(url, file, expectedSize) {
  const tmp = `${file}.part`;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!ok(res)) throw new Error(`HTTP ${res.status}`);
      const total = Number(res.headers.get("content-length") || 0);
      if (expectedSize != null && total && total !== expectedSize) {
        throw new Error(`size mismatch ${total} != ${expectedSize}`);
      }
      mkdirSync(dirname(file), { recursive: true });
      const dest = createWriteStream(tmp);
      await new Promise((resolveP, rejectP) => {
        writeStream(res.body)
          .pipe(dest)
          .on("error", rejectP);
        dest.on("finish", resolveP);
        dest.on("error", rejectP);
      });
      const got = statSync(tmp).size;
      if (expectedSize != null && got !== expectedSize) {
        throw new Error(`size mismatch on disk ${got} != ${expectedSize}`);
      }
      renameSync(tmp, file);
      return true;
} catch (err) {
      if (existsSync(tmp)) unlinkSync(tmp);
      const last = attempt === RETRIES;
      if (last) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  return false;
}

async function downloadOne(item) {
  const { url, file, size } = item;
  if (existsSync(file)) {
    const present = statSync(file).size;
    if (size == null || present === size) {
      skipped += 1;
      return;
    }
    unlinkSync(file);
  }
  try {
    await save(url, file, size);
    downloads += 1;
  } catch (err) {
    failed += 1;
    failures.push(`${file} (${err.message})`);
    if (downloads % 25 === 0 || downloads === 1) {
      console.error(`progress: +${downloads} new, ${skipped} present, ${failed} failed`);
    }
  }
}

async function runPool(items) {
  let i = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) {
      const idx = i++;
      await downloadOne(items[idx]);
    }
  });
  await Promise.all(workers);
}

function listFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else out.push(full);
  }
  return out;
}

async function main() {
  console.log(`Mirroring ${BASE} -> ${OUT}`);

  for (const file of listFiles(OUT).filter((f) => f.endsWith(".part"))) {
    rmSync(file);
    console.log(`removed stale ${file}`);
  }

  const jobs = [];

  // metadata
  const metaJob = SYMBOLS.map(async (symbol) => {
    const file = resolve(OUT, "metadata", `${symbol}.json`);
    try {
      if (!existsSync(file)) {
        await save(`${BASE}/metadata/${encodeURIComponent(symbol)}.json`, file);
        downloads += 1;
      } else {
        skipped += 1;
      }
      const meta = JSON.parse(await (await fetch(`${BASE}/metadata/${encodeURIComponent(symbol)}.json`)).text());
      for (const f of meta.files ?? []) {
        jobs.push({
          url: `${BASE}/library/${encodeURIComponent(symbol)}/all_upf_files/${encodeURIComponent(f.name)}`,
          file: resolve(OUT, "library", symbol, "all_upf_files", f.name),
          size: f.size ?? null,
        });
      }
    } catch (err) {
      failed += 1;
      failures.push(`metadata ${symbol} (${err.message})`);
    }
  });
  await Promise.all(metaJob);

  // eff_cutoffs.json
  jobs.push({
    url: `${BASE}/library/eff_cutoffs.json`,
    file: resolve(OUT, "library", "eff_cutoffs.json"),
    size: null,
  });

  // tarballs
  for (const name of TARBALLS) {
    jobs.push({
      url: `${BASE}/library/${name}_recommended.tar.gz`,
      file: resolve(OUT, "library", `${name}_recommended.tar.gz`),
      size: null,
    });
  }

  console.log(`queued ${jobs.length} files (metadata + upf + cutoffs + tarballs)`);
  await runPool(jobs);

  if (failures.length) {
    console.error(`FAILED (${failures.length}):`);
    for (const f of failures) console.error("  ", f);
  }
  console.log(`done: +${downloads} downloaded, ${skipped} present, ${failed} failed`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});