import { PSEUDO_BASE } from "./qeconfig";

export function getPseudoBase() {
  if (typeof window !== "undefined" && window.QEINPUTGEN_PSEUDO_BASE) {
    return window.QEINPUTGEN_PSEUDO_BASE;
  }
  if (import.meta.env?.VITE_PSEUDO_BASE) {
    return import.meta.env.VITE_PSEUDO_BASE;
  }
  return PSEUDO_BASE;
}

const elementMetaCache = new Map();
let effCutoffsCache = null;

export async function fetchElementMeta(symbol) {
  if (elementMetaCache.has(symbol)) return elementMetaCache.get(symbol);
  const base = getPseudoBase();
  const res = await fetch(
    `${base}/metadata/${encodeURIComponent(symbol)}.json`,
  );
  if (!res.ok) {
    throw new Error(`No SSSP metadata for ${symbol} (${res.status})`);
  }
  const data = await res.json();
  elementMetaCache.set(symbol, data);
  return data;
}

export async function fetchEffCutoffs() {
  if (effCutoffsCache) return effCutoffsCache;
  const base = getPseudoBase();
  const res = await fetch(`${base}/library/eff_cutoffs.json`);
  if (!res.ok) throw new Error(`No cutoff table available (${res.status})`);
  const data = await res.json();
  effCutoffsCache = data;
  return data;
}

export function recommendedPseudoName(meta, functional, tier) {
  if (!meta?.recommended) return null;
  return meta.recommended[`${tier}_${functional}`] ?? null;
}

export function pseudoDownloadUrl(symbol, filename) {
  const base = getPseudoBase();
  return `${base}/library/${encodeURIComponent(
    symbol,
  )}/all_upf_files/${encodeURIComponent(filename)}`;
}

export function recommendedTarballUrl(functional, tier) {
  const base = getPseudoBase();
  return `${base}/library/${tier}_${functional}_recommended.tar.gz`;
}

// Resolve the plane-wave cutoffs for a pseudo file entry. Structured cutoffs
// live under file.cutoffs[<tier>] for recommended pseudos; the rest carry a
// single number under csv_ecut_eff / csv_ecut_prec. QE's default ecutrho is
// 4 × ecutwfc, so we fall back to that when only the plane-wave cutoff is
// published (marked as derivedRho).
export function resolveCutoffs(file, tier = "eff") {
  if (!file) return null;
  const other = tier === "prec" ? "eff" : "prec";
  const co = file.cutoffs?.[tier] ?? file.cutoffs?.[other];
  if (co && (co.cutoff_wfc != null || co.cutoff_rho != null)) {
    const ecutwfc = co.cutoff_wfc != null ? Number(co.cutoff_wfc) : null;
    const ecutrho = co.cutoff_rho != null ? Number(co.cutoff_rho) : null;
    return {
      ecutwfc,
      ecutrho: ecutrho ?? (ecutwfc != null ? 4 * ecutwfc : null),
      derivedRho: ecutrho == null,
    };
  }
  const csv =
    tier === "prec"
      ? (file.csv_ecut_prec ?? file.csv_ecut_eff)
      : (file.csv_ecut_eff ?? file.csv_ecut_prec);
  const wfc = Number(csv);
  if (!Number.isFinite(wfc) || wfc <= 0) return null;
  return { ecutwfc: wfc, ecutrho: 4 * wfc, derivedRho: true };
}