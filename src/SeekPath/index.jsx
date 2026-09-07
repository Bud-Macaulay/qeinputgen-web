import { useCallback, useEffect, useRef, useState } from "react";
import { createBZVisualizer } from "brillouinzone-visualizer";
import StructureVisualizer from "mc-react-structure-visualizer";
import { getBrillouinZoneData, toCrystalD3, toKPOINTS } from "matsci-parse";

import { formatSpaceGroupSymbol, preparePWText, prettify } from "../utils";

import TextRenderer from "../components/TextRenderer";

const DEFAULT_REFERENCE_DISTANCE = 0.025;
const MIN_POINTS_PER_LINE = 2;
const MAX_POINTS_PER_LINE = 100;
const DEFAULT_POINTS_PER_LINE = 40;

export default function SeekPath({ structure, className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [withTimeReversal, setWithTimeReversal] = useState(true);
  const [referenceDistance] = useState(DEFAULT_REFERENCE_DISTANCE);
  const [pointsPerLine, setPointsPerLine] = useState(DEFAULT_POINTS_PER_LINE);
  const [outputsOpen, setOutputsOpen] = useState("vasp");

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
    [structure],
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
      showPathpoints: false,
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

  if (!structure) {
    return <></>;
  }

  const pathSummary = data
    ? data.path.map(([a, b]) => `${prettify(a)}\u2013${prettify(b)}`).join(", ")
    : "";

  const vaspKpointsText = data ? toKPOINTS(data.kpath, pointsPerLine) : "";
  const crystalD3Text = data
    ? toCrystalD3(data.kpath, "SeeK-path band path", pointsPerLine)
    : "";
  const pwInputText = data
    ? preparePWText(structure, data.kpath, pointsPerLine)
    : "";

  return (
    <div className={`space-y-3 ${className}`}>
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
              {data.spacegroup_number} (
              {formatSpaceGroupSymbol(data.spacegroup_international)})
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

          {!withTimeReversal && data && !data.augmented_path && (
            <div className="rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-xs text-slate-500">
              Path unaffected by the time-reversal toggle: this structure has
              inversion symmetry, so k and -k are already equivalent.
            </div>
          )}
        </div>
      )}

      {data && (
        <>
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
          <TextRenderer
            title="KPOINTS (VASP)"
            text={vaspKpointsText}
            filename="KPOINTS"
            open={outputsOpen === "vasp"}
            onToggle={() =>
              setOutputsOpen((prev) => (prev === "vasp" ? null : "vasp"))
            }
          />

          <TextRenderer
            title="Quantum ESPRESSO pw.x input"
            text={pwInputText}
            filename="PW.in"
            open={outputsOpen === "pw"}
            onToggle={() =>
              setOutputsOpen((prev) => (prev === "pw" ? null : "pw"))
            }
          />

          <TextRenderer
            title="CRYSTAL D3 BAND"
            text={crystalD3Text}
            filename="BAND"
            open={outputsOpen === "d3"}
            onToggle={() =>
              setOutputsOpen((prev) => (prev === "d3" ? null : "d3"))
            }
          />
        </>
      )}

      {data && (
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
              Brillouin zone visualization
            </div>
            <div
              ref={containerRef}
              className="h-[480px] w-full overflow-hidden"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
              Primitive cell ({structure ? "as loaded" : ""})
            </div>
            {structure && (
              <div className="h-[480px] w-full">
                <StructureVisualizer structure={structure} />
              </div>
            )}
          </div>
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
