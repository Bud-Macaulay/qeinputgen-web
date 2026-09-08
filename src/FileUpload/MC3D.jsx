import { useState } from "react";
import { fromStructureData } from "matsci-parse";

const DATASETS = [
  { value: "pbesol-v2", label: "pbesol-v2" },
  { value: "pbesol-v1", label: "pbesol-v1" },
  { value: "pbe-v1", label: "pbe-v1" },
];

const MC3D_BASE = "https://mcxd-api.materialscloud.org/mc3d";
const AiiDA_API = "https://aiida.materialscloud.org";

export default function MC3DInput({ onStructureParsed, className = "" }) {
  const [id, setId] = useState("");
  const [dataset, setDataset] = useState("pbesol-v2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoad = async () => {
    const trimmed = id.trim();
    if (!/^mc3d-\d+$/i.test(trimmed)) {
      setError('Enter an MC3D ID such as "mc3d-10017".');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const meta = await (
        await fetch(`${MC3D_BASE}/${dataset}/core_base/${trimmed}`)
      ).json();
      const uuid = meta.general?.structure_uuid;
      if (!uuid) throw new Error(`No structure found for ${trimmed}.`);

      const attributes = (
        await (
          await fetch(
            `${AiiDA_API}/mc3d-${dataset}/api/v4/nodes/${uuid}/contents/attributes`,
          )
        ).json()
      ).data.attributes;

      const structure = fromStructureData(attributes);
      onStructureParsed?.({
        format: "aiida",
        structure,
        fileName: `${trimmed}_${dataset}`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

return (
    <div className={className}>
      <p className="mb-2 text-sm font-semibold text-slate-800">From MC3D-ID</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleLoad();
          }}
          placeholder="mc3d-10017"
          disabled={loading}
          className="w-full max-w-[9rem] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <select
          value={dataset}
          onChange={(e) => setDataset(e.target.value)}
          disabled={loading}
          className="w-full max-w-[9rem] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {DATASETS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleLoad}
          disabled={loading}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading…" : "Load"}
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        Load a crystal structure from the Material Cloud MC3D database by ID.
      </p>
      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
