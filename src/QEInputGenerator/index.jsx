import { useEffect, useMemo, useState } from "react";
import StructureVisualizer from "mc-react-structure-visualizer";
import { getSpecies, getSymmetry, iupacFormula, numAtoms, toPW } from "matsci-parse";

import TextRenderer from "../components/TextRenderer";
import { formatSpaceGroupSymbol } from "../utils";
import {
  ACCURACY,
  ACCURACY_PSEUDO_TIER,
  CONTROL_FIXED,
  FUNCTIONALS,
  PSEUDO_DIR,
  SMEARING,
  SYSTEM_FIXED,
} from "./qeconfig";
import {
  fetchEffCutoffs,
  fetchElementMeta,
  pseudoDownloadUrl,
  recommendedPseudoName,
  recommendedTarballUrl,
  resolveCutoffs,
} from "./pseudo";

const ACCURACY_OPTIONS = Object.entries(ACCURACY).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const FUNCTIONAL_OPTIONS = Object.entries(FUNCTIONALS).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const SMEARING_OPTIONS = Object.entries(SMEARING).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function QEInputGenerator({ structure, className = "" }) {
  const [accuracy, setAccuracy] = useState("medium");
  const [functional, setFunctional] = useState("pbe");
  const [smearingKey, setSmearingKey] = useState("metallic");

  const [pseudoMeta, setPseudoMeta] = useState({});
  const [pseudoFiles, setPseudoFiles] = useState({});
  const [pseudoLoading, setPseudoLoading] = useState(false);
  const [pseudoError, setPseudoError] = useState(null);
  const [fallbackCutoffs, setFallbackCutoffs] = useState({});
  const [selections, setSelections] = useState({});

  const [symmetry, setSymmetry] = useState(null);
  const [symmetryLoading, setSymmetryLoading] = useState(false);
  const [symmetryError, setSymmetryError] = useState(null);

  const species = useMemo(
    () => (structure ? getSpecies(structure).map((s) => s.symbol) : []),
    [structure],
  );

  const formula = useMemo(
    () => (structure ? iupacFormula(structure) : ""),
    [structure],
  );

  useEffect(() => {
    if (!structure) {
      setSymmetry(null);
      return;
    }
    let cancelled = false;
    setSymmetryLoading(true);
    setSymmetryError(null);
    getSymmetry(structure)
      .then((result) => {
        if (!cancelled) setSymmetry(result);
      })
      .catch((err) => {
        if (!cancelled)
          setSymmetryError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setSymmetryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [structure]);

  useEffect(() => {
    if (!species.length) {
      setPseudoMeta({});
      setPseudoFiles({});
      setSelections({});
      return;
    }
    let cancelled = false;
    const load = async () => {
      setPseudoLoading(true);
      setPseudoError(null);
      const meta = {};
      const files = {};
      let sawError = null;
      for (const symbol of species) {
        try {
          const data = await fetchElementMeta(symbol);
          if (cancelled) return;
          meta[symbol] = data;
          files[symbol] = data.files ?? [];
        } catch (err) {
          if (cancelled) return;
          meta[symbol] = null;
          files[symbol] = [];
          sawError = err instanceof Error ? err.message : String(err);
        }
      }
      try {
        const cutoffs = await fetchEffCutoffs();
        if (cancelled) return;
        setFallbackCutoffs(cutoffs);
      } catch {
        if (!cancelled) setFallbackCutoffs({});
      }
      if (!cancelled) {
        setPseudoMeta(meta);
        setPseudoFiles(files);
        if (sawError) {
          setPseudoError(
            `Some pseudopotential metadata could not be loaded: ${sawError}`,
          );
        }
        setPseudoLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [species]);

  const tier = ACCURACY_PSEUDO_TIER[accuracy];

  useEffect(() => {
    if (!species.length) return;
    setSelections((prev) => {
      const next = { ...prev };
      for (const symbol of species) {
        const files = pseudoFiles[symbol] ?? [];
        const rec = recommendedPseudoName(
          pseudoMeta[symbol],
          functional,
          accuracy,
        );
        if (rec && files.some((f) => f.name === rec)) next[symbol] = rec;
        else if (files.length > 0 && !next[symbol])
          next[symbol] = files[0].name;
      }
      return next;
    });
  }, [species, pseudoMeta, pseudoFiles, functional, accuracy]);

  const effectiveCutoffs = useMemo(() => {
    if (!species.length) return { ecutwfc: 0, ecutrho: 0 };
    let wfc = 0;
    let rho = 0;
    for (const symbol of species) {
      const file = (pseudoFiles[symbol] ?? []).find(
        (f) => f.name === selections[symbol],
      );
      const co = resolveCutoffs(file, tier);
      wfc = Math.max(wfc, co?.ecutwfc ?? fallbackCutoffs[symbol]?.cutoff_wfc ?? 0);
      rho = Math.max(rho, co?.ecutrho ?? fallbackCutoffs[symbol]?.cutoff_rho ?? 0);
    }
    return { ecutwfc: wfc, ecutrho: rho };
  }, [species, selections, pseudoFiles, fallbackCutoffs, tier]);

  const pwText = useMemo(() => {
    if (!structure || !species.length) return "";
    const acc = ACCURACY[accuracy];
    const smearing = SMEARING[smearingKey];
    const pseudos = {};
    for (const symbol of species) {
      pseudos[symbol] = selections[symbol] || `${symbol}.UPF`;
    }
    return toPW(structure, {
      control: {
        title: `qeinputgen-web ${FUNCTIONALS[functional].label}`,
        calculation: "scf",
        pseudo_dir: PSEUDO_DIR,
        etot_conv_thr: acc.etot_conv_thr,
        forc_conv_thr: acc.forc_conv_thr,
        ...CONTROL_FIXED,
      },
      system: {
        ...(effectiveCutoffs.ecutwfc > 0 && {
          ecutwfc: parseFloat(effectiveCutoffs.ecutwfc.toFixed(1)),
        }),
        ...(effectiveCutoffs.ecutrho > 0 && {
          ecutrho: parseFloat(effectiveCutoffs.ecutrho.toFixed(1)),
        }),
        ...SYSTEM_FIXED,
        ...smearing.system,
      },
      electrons: {
        conv_thr: acc.conv_thr,
      },
      kpoints: {
        kspacing: acc.kspacing,
      },
      pseudo: { pseudos },
    });
  }, [
    structure,
    species,
    selections,
    accuracy,
    functional,
    smearingKey,
    effectiveCutoffs,
  ]);

  const zipFiles = useMemo(
    () =>
      species
        .filter((s) => selections[s])
        .map((s) => ({
          name: `pseudo/${selections[s]}`,
          url: pseudoDownloadUrl(s, selections[s]),
        })),
    [species, selections],
  );

  if (!structure) return <></>;

  const acc = ACCURACY[accuracy];
  // const lat = latticeParams(structure.lattice);
  const ntyp = species.length;
  const tarballUrl = recommendedTarballUrl(functional, accuracy);
  const calcResults = symmetry?.calculationResults;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
          Calculation parameters
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-3">
          <Select
            label="Accuracy"
            value={accuracy}
            options={ACCURACY_OPTIONS}
            onChange={setAccuracy}
          />
          <Select
            label="Exchange-correlation functional"
            value={functional}
            options={FUNCTIONAL_OPTIONS}
            onChange={setFunctional}
          />
          <Select
            label="Smearing / occupations"
            value={smearingKey}
            options={SMEARING_OPTIONS}
            onChange={setSmearingKey}
          />
        </div>
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-xs text-slate-500">
          k-point spacing {acc.kspacing} Å⁻¹ · plane-wave cutoff{" "}
          {effectiveCutoffs.ecutwfc > 0
            ? `${effectiveCutoffs.ecutwfc.toFixed(1)} Ry`
            : "—"}{" "}
          · charge-density cutoff{" "}
          {effectiveCutoffs.ecutrho > 0
            ? `${effectiveCutoffs.ecutrho.toFixed(1)} Ry`
            : "—"}{" "}
          · conv_thr {acc.conv_thr} · etot_conv_thr {acc.etot_conv_thr} ·
          forc_conv_thr {acc.forc_conv_thr}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
          Pseudopotentials (SSSP v2.0, {tier} tier)
        </div>
        {pseudoLoading && (
          <div className="flex h-24 items-center justify-center text-sm text-slate-500">
            Loading SSSP metadata…
          </div>
        )}
        {pseudoError && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
            {pseudoError}
          </div>
        )}
        {!pseudoLoading && (
          <div className="divide-y divide-slate-100">
            {species.map((symbol) => {
              const files = pseudoFiles[symbol] ?? [];
              const selected = selections[symbol];
              const file = files.find((f) => f.name === selected);
              const rec = recommendedPseudoName(
                pseudoMeta[symbol],
                functional,
                accuracy,
              );
              const co = resolveCutoffs(file, tier);
              return (
                <div
                  key={symbol}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <span className="w-10 text-sm font-semibold text-slate-800">
                    {symbol}
                  </span>
                  {files.length > 0 ? (
                    <select
                      value={selected}
                      onChange={(e) =>
                        setSelections((prev) => ({
                          ...prev,
                          [symbol]: e.target.value,
                        }))
                      }
                      className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {files.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.name === rec ? "★ " : ""}
                          {f.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="flex-1 text-xs text-red-600">
                      No pseudopotentials found
                    </span>
                  )}
                  {co?.ecutwfc != null && (
                    <span
                      className="whitespace-nowrap font-mono text-[10px] text-slate-500"
                      title={co.derivedRho ? "cutoffs read from csv_ecut_*; ecutrho = 4 × ecutwfc (QE default)" : "cutoffs read from UPF metadata"}
                    >
                      ecutwfc {co.ecutwfc} Ry
                    </span>
                  )}
                  {co?.ecutrho != null && (
                    <span
                      className="whitespace-nowrap font-mono text-[10px] text-slate-500"
                      title={co.derivedRho ? "ecutrho = 4 × ecutwfc (QE default)" : "cutoffs read from UPF metadata"}
                    >
                      ecutrho {co.ecutrho} Ry
                    </span>
                  )}
                  {file?.pp_type && (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                      {file.pp_type.toUpperCase()}
                    </span>
                  )}
                  {selected && selected === rec && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                      recommended
                    </span>
                  )}
                  {selected && (
                    <a
                      href={pseudoDownloadUrl(symbol, selected)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-xs text-slate-500">
          The generated input sets{" "}
          <code className="font-mono">{`pseudo_dir = '${PSEUDO_DIR}'`}</code>{" "}
          and names the pseudopotentials above. Get a ready-made set with:{" "}
          <a
            href={tarballUrl}
            className="font-medium text-blue-600 hover:underline"
          >
            {`${tier}_${functional}_recommended.tar.gz`}
          </a>{" "}
          (extract it into {PSEUDO_DIR}).
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700  ">
          About your structure
        </div>
        <div className="p-4 ">
          <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
            {symmetryLoading && (
              <span className="text-slate-400">Determining symmetry…</span>
            )}
            {symmetryError && (
              <span className="text-red-600">Symmetry analysis failed</span>
            )}
            {calcResults && (
              <span>
                <span className="text-slate-400">Space group </span>
                <span className="font-mono">
                  {calcResults.number} (
                  {formatSpaceGroupSymbol(calcResults.hm_symbol)})
                </span>
              </span>
            )}
            <span>
              <span className="text-slate-400">Formula </span>
              <span className="font-mono">{formula}</span>
            </span>
            <span>
              <span className="text-slate-400">Atoms </span>
              <span className="font-mono">
                {numAtoms(structure)} ({ntyp} species)
              </span>
            </span>
          </div>
          <div className="h-[500px] w-[500px] mx-auto">
            <StructureVisualizer structure={structure} />
          </div>
        </div>
      </div>

      <TextRenderer
        title="Quantum ESPRESSO pw.x input"
        text={pwText}
        filename="PW.in"
        zipFiles={zipFiles}
        zipName={`qeinputgen-${formula || "input-set"}.zip`}
      />
    </div>
  );
}
