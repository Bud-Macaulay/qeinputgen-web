import { ACCURACY_PSEUDO_TIER, PSEUDO_BASE } from "./qeconfig";

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

export function recommendedPseudoName(meta, functional, accuracy) {
  if (!meta?.recommended) return null;
  const tier = ACCURACY_PSEUDO_TIER[accuracy];
  return meta.recommended[`${tier}_${functional}`] ?? null;
}

export function pseudoTierForAccuracy(accuracy) {
  return ACCURACY_PSEUDO_TIER[accuracy];
}

export function pseudoDownloadUrl(symbol, filename) {
  const base = getPseudoBase();
  return `${base}/library/${encodeURIComponent(
    symbol,
  )}/all_upf_files/${encodeURIComponent(filename)}`;
}

export function recommendedTarballUrl(functional, accuracy) {
  const tier = ACCURACY_PSEUDO_TIER[accuracy];
  const base = getPseudoBase();
  return `${base}/library/${tier}_${functional}_recommended.tar.gz`;
}