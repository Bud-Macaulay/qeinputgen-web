import { useEffect, useState } from "react";
import { fromJSON, toJSON } from "matsci-parse";

import { parseFileText } from "./formats";
import { examples } from "./examples";
import {
  HashModal,
  McDropzone,
  McHistoryList,
  createHistoryStore,
} from "mc-react-library";
import RemoteStructureLoader, {
  shortHashForUrl,
} from "../lib/RemoteStructureLoader.jsx";

const historyStore = createHistoryStore("qeinputgen.parsedStructures");

export default function CrystalStructureUpload({
  onStructureParsed,
  className = "",
}) {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [parsedFormat, setParsedFormat] = useState(null);
  const [history, setHistory] = useState(() => historyStore.load());
  const [exampleLoading, setExampleLoading] = useState(null);
  // When ?fromURL is already in history (matched by short hash before any
  // fetch), load it from local storage instead of hitting the backend.
  const [remoteAutoLoad, setRemoteAutoLoad] = useState(true);

  useEffect(() => {
    try {
      const url = new URLSearchParams(window.location.search).get("fromURL");
      const hash = url && shortHashForUrl(url);
      const existing =
        hash && historyStore.load().find((entry) => entry.fileName === hash);
      if (existing) {
        setRemoteAutoLoad(false);
        onStructureParsed?.({
          format: existing.format,
          structure: fromJSON(existing.structure),
          fileName: existing.fileName,
          id: existing.id,
        });
        setParsedFormat(existing.format);
      }
    } catch {
      /* fall through to remote fetch */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoteLoaded = ({ structure, format, fileName }) => {
    setError(null);
    setParsedFormat(format);
    onStructureParsed?.({ format, structure, fileName });
    if (historyStore.load().some((entry) => entry.fileName === fileName))
      return;
    setHistory(
      historyStore.add({
        id: crypto.randomUUID(),
        fileName,
        format,
        date: new Date().toISOString(),
        structure: toJSON(structure),
      }),
    );
  };

  useEffect(() => {
    setHistory(historyStore.load());
  }, []);

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setParsedFormat(null);
    setParsing(true);

    try {
      const text = await selectedFile.text();
      const { format, structure } = parseFileText(text);
      setParsedFormat(format);
      onStructureParsed?.({ format, structure, fileName: selectedFile.name });

      const entry = {
        id: crypto.randomUUID(),
        fileName: selectedFile.name,
        format,
        date: new Date().toISOString(),
        structure: toJSON(structure),
      };
      setHistory(historyStore.add(entry));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setParsing(false);
    }
  };

  const handleLoadFromHistory = (entry) => {
    setError(null);
    setParsedFormat(null);
    try {
      const structure = fromJSON(entry.structure);
      onStructureParsed?.({
        format: entry.format,
        structure,
        fileName: entry.fileName,
        id: entry.id,
      });
      setParsedFormat(entry.format);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleMC3DParsed = (opts) => {
    setError(null);
    setParsedFormat(opts.format);
    const entry = {
      id: crypto.randomUUID(),
      fileName: opts.fileName,
      format: opts.format,
      date: new Date().toISOString(),
      structure: toJSON(opts.structure),
    };
    setHistory(historyStore.add(entry));
    onStructureParsed?.(opts);
  };

  const handleLoadExample = async (example) => {
    setError(null);
    setParsedFormat(null);
    setExampleLoading(example.url);
    try {
      const res = await fetch(example.url);
      if (!res.ok) throw new Error(`Failed to load example (${res.status})`);
      const structure = fromJSON(JSON.parse(await res.text()));
      setParsedFormat("json");
      onStructureParsed?.({
        format: "json",
        structure,
        fileName: `${example.symbol}.json`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExampleLoading(null);
    }
  };

  const handleDeleteFromHistory = (id) => {
    setHistory(historyStore.remove(id));
  };

  const handleClearHistory = () => {
    setHistory(historyStore.clear());
  };

  return (
    <div className={`pt-2 ${className}`}>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        Upload a crystal structure
      </label>

      <McDropzone
        accept=".cif,.xyz,.vasp,.poscar,.xsf,.in,.pwi"
        fileName={file?.name}
        onFile={handleFile}
        title="Drop your crystal structure here"
        hint="CIF, XYZ, POSCAR, XSF and Quantum ESPRESSO files"
      />

      <p className="mt-3 text-center text-xs text-slate-400">
        By continuing you agree to our{" "}
        <a
          href="#terms"
          className="font-medium text-blue-600 underline-offset-2 hover:underline"
        >
          Terms of service
        </a>
      </p>

      <HashModal hash="terms" title="Terms of service">
        <div className="space-y-2">
          <h3 className="font-semibold">Links To Other Web Sites</h3>
          <p>
            Our Service may contain links to third­-party web sites or services
            that are not owned or controlled by us. We have no control over, and
            assumes no responsibility for, the content, privacy policies, or
            practices of any third party web sites or services. You further
            acknowledge and agree that we shall not be responsible or liable,
            directly or indirectly, for any damage or loss caused or alleged to
            be caused by or in connection with use of or reliance on any such
            content, goods or services available on or through any such web
            sites or services.
          </p>
          <p>
            We strongly advise you to read the terms and conditions and privacy
            policies of any third-­party web sites or services that you visit.
          </p>
          <h3 className="font-semibold">Changes</h3>
          <p>
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. By continuing to access or use our Service
            after those revisions become effective, you agree to be bound by the
            revised terms. If you do not agree to the new terms, please stop
            using the Service.
          </p>
          <h3 className="font-semibold">Contact Us</h3>
          <p>If you have any questions about these Terms, please contact us.</p>
        </div>
      </HashModal>

      {parsing && (
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Parsing {file?.name}...
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <RemoteStructureLoader
        autoLoad={remoteAutoLoad}
        onLoaded={handleRemoteLoaded}
        onError={(message) => setError(message)}
      />

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">
              Otherwise, pick an example
            </p>
            <select
              value=""
              onChange={(e) => {
                const example = examples.find((x) => x.url === e.target.value);
                if (example) handleLoadExample(example);
              }}
              disabled={exampleLoading !== null}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {exampleLoading ? "Loading example…" : "Select an example…"}
              </option>
              {Object.entries(
                examples.reduce((groups, example) => {
                  (groups[example.family] ||= []).push(example);
                  return groups;
                }, {}),
              ).map(([family, familyExamples]) => (
                <optgroup key={family} label={family}>
                  {familyExamples.map((example) => (
                    <option key={example.url} value={example.url}>
                      {example.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-5">
          <McHistoryList
            title="Your previously loaded structures"
            entries={history}
            onLoad={handleLoadFromHistory}
            onDelete={handleDeleteFromHistory}
            onClear={handleClearHistory}
          />
        </div>
      )}
    </div>
  );
}
