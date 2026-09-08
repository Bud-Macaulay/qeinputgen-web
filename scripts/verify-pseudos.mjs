import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/pseudo");

const metaDir = resolve(OUT, "metadata");
let metas = 0;
let missing = 0;
let checked = 0;
const problems = [];

for (const sym of readdirSync(metaDir).filter((f) => f.endsWith(".json"))) {
  metas += 1;
  let meta;
  try {
    meta = JSON.parse(readFileSync(resolve(metaDir, sym), "utf8"));
  } catch (err) {
    problems.push(`${sym} metadata unreadable: ${err.message}`);
    continue;
  }
  if (meta.element && !meta.files) {
    problems.push(`${sym} metadata has no files[]`);
  }
  for (const f of meta.files ?? []) {
    checked += 1;
    const local = resolve(OUT, "library", sym.replace(/\.json$/, ""), "all_upf_files", f.name);
    if (!existsSync(local)) {
      missing += 1;
      problems.push(`missing ${f.name}`);
      continue;
    }
    if (f.size != null && statSync(local).size !== f.size) {
      problems.push(`size mismatch ${f.name}: local ${statSync(local).size} != ${f.size}`);
    }
  }
}

let upfs = 0;
for (const dir of readdirSync(resolve(OUT, "library"))) {
  const all = resolve(OUT, "library", dir, "all_upf_files");
  if (existsSync(all)) upfs += readdirSync(all).length;
}

const tarballs = ["eff_pbe_recommended.tar.gz", "eff_pbesol_recommended.tar.gz", "prec_pbe_recommended.tar.gz", "prec_pbesol_recommended.tar.gz"];
const cutoffs = existsSync(resolve(OUT, "library", "eff_cutoffs.json"));

console.log(`metadata files: ${metas}`);
console.log(`upf files on disk: ${upfs}`);
console.log(`upf entries checked against metadata: ${checked}; missing: ${missing}`);
console.log(`tarballs present: ${tarballs.filter((t) => existsSync(resolve(OUT, "library", t))).length}/4`);
console.log(`eff_cutoffs.json: ${cutoffs ? "yes" : "NO"}`);
if (problems.length) {
  console.log("PROBLEMS:");
  for (const p of problems) console.log("  ", p);
} else {
  console.log("all sizes match metadata");
}