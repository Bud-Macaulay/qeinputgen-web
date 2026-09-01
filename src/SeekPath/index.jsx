import { useCallback, useEffect, useRef, useState } from "react";
import { createBZVisualizer } from "brillouinzone-visualizer";
import { getBrillouinZoneData, kpointsToPW, toKPOINTS } from "matsci-parse";

const prettify = (label) =>
  label
    .replace(/GAMMA/g, "\u0393")
    .replace(/SIGMA_0/g, "\u03A3")
    .replace(/-/g, "\u2013")
    .replace(/_/g, "\u2081");

function formatSpaceGroupSymbol(symbol) {
  let nextIsSub = false;
  let nextIsNegative = false;
  return symbol.split("").map((v, index) => {
    if (v === "-") {
      nextIsNegative = true;
      return null;
    }
    if (v === "_") {
      nextIsSub = true;
      return null;
    }
    if (nextIsNegative) {
      nextIsNegative = false;
      return (
        <span className="relative inline-block" key={index}>
          <span className="absolute inset-x-0 top-[0.15em] h-0 border-t-[0.1em] border-black" />
          {v}
        </span>
      );
    }
    if (nextIsSub) {
      nextIsSub = false;
      return <sub key={index}>{v}</sub>;
    }
    return v;
  });
}

const DEFAULT_REFERENCE_DISTANCE = 0.025;
const MIN_POINTS_PER_LINE = 2;
const MAX_POINTS_PER_LINE = 100;
const DEFAULT_POINTS_PER_LINE = 40;

function totalToReferenceDistance(data, targetTotal) {
  if (!data) return DEFAULT_REFERENCE_DISTANCE;
  const linear = data.explicit_kpoints_linearcoord;
  if (!linear || linear.length < 2) return DEFAULT_REFERENCE_DISTANCE;
  const totalLength = linear[linear.length - 1];
  return Math.max(1e-4, totalLength / Math.max(1, targetTotal - 1));
}

function estimatedKpointTotal(data, pointsPerLine) {
  if (!data || data.path.length === 0) return 0;
  return data.path.length * (pointsPerLine - 1) + 1;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SeekPath({ structure, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [withTimeReversal, setWithTimeReversal] = useState(true);
  const [referenceDistance, setReferenceDistance] = useState(
    DEFAULT_REFERENCE_DISTANCE
  );
  const [pointsPerLine, setPointsPerLine] = useState(DEFAULT_POINTS_PER_LINE);

  const containerRef = useRef(null);

  const compute = useCallback(
    async (wtr, refDist) => {
      if (!structure) return;
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const bzData = await getBrillouinZoneData(structure, {
          withTimeReversal: wtr,
          referenceDistance: refDist,
        });
        setData(bzData);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [structure]
  );

  useEffect(() => {
    if (!structure) {
      setData(null);
      setError(null);
      return;
    }
    compute(withTimeReversal, referenceDistance);
  }, [structure, compute]);

  useEffect(() => {
    if (!data || !containerRef.current) return;

    const container = containerRef.current;
    const viz = createBZVisualizer(container, data, {
      showPathpoints: true,
      disableInteractOverlay: true,
    });

    return () => {
      window.removeEventListener("resize", viz.resizeRenderer);
      if (container) container.innerHTML = "";
    };
  }, [data]);

  const handleToggleTimeReversal = (e) => {
    const wtr = e.target.checked;
    setWithTimeReversal(wtr);
    compute(wtr, referenceDistance);
  };

  const handleRecalculate = () => {
    const refDist = totalToReferenceDistance(
      data,
      estimatedKpointTotal(data, pointsPerLine)
    );
    setReferenceDistance(refDist);
    compute(withTimeReversal, refDist);
  };

  const handleDownload = (filename, serialize) => {
    downloadFile(filename, serialize());
  };

  if (!structure) {
    return (
      <div className={`py-4 text-sm text-slate-500 ${className}`}>
        Upload or load a structure to compute its high-symmetry k-path.
      </div>
    );
  }

  const pathSummary = data
    ? data.path.map(([a, b]) => `${prettify(a)}\u2013${prettify(b)}`).join(", ")
    : "";

  const proposedSpacing = totalToReferenceDistance(
    data,
    estimatedKpointTotal(data, pointsPerLine)
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800">
        This module calculates the primitive cell first. If you want to run a
        new simulation with this path, use the primitive cell.
      </div>

      {data && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          <span>
            <span className="text-slate-400">Bravais </span>
            <span className="font-mono">
              {data.bravais_lattice_extended} ({data.bravais_lattice})
            </span>
          </span>
          <span>
            <span className="text-slate-400">SG </span>
            <span className="font-mono">
              {data.spacegroup_number} ({formatSpaceGroupSymbol(data.spacegroup_international)})
            </span>
          </span>
          <span>
            <span className="text-slate-400">Inversion </span>
            <span className="font-mono">
              {data.has_inversion_symmetry ? "yes" : "no"}
            </span>
          </span>
          <label
            className="flex cursor-pointer select-none items-center gap-1.5"
            title="When off, and the structure has no inversion symmetry, the path is augmented with -k segments (HPKOT)"
          >
            <input
              type="checkbox"
              checked={withTimeReversal}
              onChange={handleToggleTimeReversal}
              className="accent-blue-600"
            />
            <span>Time-reversal symmetry</span>
          </label>
          <span>
            <span className="text-slate-400">Path </span>
            <span className="font-mono">{pathSummary}</span>
            {data.augmented_path && (
              <span className="ml-1.5 inline-flex items-center rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                augmented
              </span>
            )}
          </span>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() =>
                handleDownload("KPOINTS", () =>
                  toKPOINTS(data.kpath, pointsPerLine)
                )
              }
              className="rounded-md bg-emerald-600 px-2.5 py-1 font-medium text-white transition hover:bg-emerald-700"
            >
              KPOINTS (VASP)
            </button>
            <button
              type="button"
              onClick={() =>
                handleDownload("K_POINTS", () =>
                  kpointsToPW(data.kpath, pointsPerLine)
                )
              }
              className="rounded-md bg-emerald-600 px-2.5 py-1 font-medium text-white transition hover:bg-emerald-700"
            >
              K_POINTS (pw)
            </button>
          </div>
        </div>
      )}

      {!withTimeReversal && data && !data.augmented_path && (
        <div className="rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-xs text-slate-500">
          Path unaffected by the time-reversal toggle: this structure has
          inversion symmetry, so k and -k are already equivalent.
        </div>
      )}

      {data && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
          <label className="flex select-none items-center gap-2">
            <span className="whitespace-nowrap text-slate-400">
              Points/line
            </span>
            <input
              type="range"
              min={MIN_POINTS_PER_LINE}
              max={MAX_POINTS_PER_LINE}
              step={1}
              value={pointsPerLine}
              onChange={(e) =>
                setPointsPerLine(parseInt(e.target.value, 10) || 0)
              }
              className="w-48 accent-blue-600"
            />
            <span className="w-12 text-right font-mono">{pointsPerLine}</span>
          </label>
          <span>
            <span className="text-slate-400">~total </span>
            <span className="font-mono">
              {estimatedKpointTotal(data, pointsPerLine)}
            </span>
          </span>
          <span>
            <span className="text-slate-400">actual </span>
            <span className="font-mono">{data.explicit_kpoints_rel.length}</span>
          </span>
          <span>
            <span className="text-slate-400">spacing </span>
            <span className="font-mono">{proposedSpacing.toFixed(4)}</span>
            <span className="text-slate-400"> Å⁻¹</span>
          </span>
          <button
            type="button"
            onClick={handleRecalculate}
            className="rounded-md border border-indigo-300 bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700 transition hover:bg-indigo-100"
          >
            Recalculate
          </button>
        </div>
      )}

      {data && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
            Brillouin zone visualization
          </div>
          <div
            ref={containerRef}
            className="h-[480px] w-full overflow-hidden"
          />
        </div>
      )}

      {data && (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
            High-symmetry k-points
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-3 py-1.5 font-medium">Label</th>
                <th className="px-3 py-1.5 font-medium">Rel. coords</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.kpoints_rel).map(([label, coords]) => (
                <tr key={label} className="border-b border-slate-50">
                  <td className="px-3 py-1.5 font-mono">{prettify(label)}</td>
                  <td className="px-3 py-1.5 font-mono text-slate-700">
                    {coords.map((c) => c.toFixed(4)).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="flex h-40 items-center justify-center text-sm text-slate-500">
          Computing high-symmetry k-path…
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center rounded-lg bg-red-50 px-3 py-6 text-sm text-red-600">
          Failed to compute the Brillouin zone: {error}
        </div>
      )}
    </div>
  );
}