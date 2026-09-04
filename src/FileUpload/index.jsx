import { useEffect, useRef, useState } from "react";
import { fromJSON, toJSON } from "matsci-parse";

import { parseFileText } from "./formats";
import { examples } from "./examples";
import Modal from "../components/Modal";
import {
  addHistoryEntry,
  clearHistory,
  loadHistory,
  removeHistoryEntry,
} from "./history";

export default function CrystalStructureUpload({
  onStructureParsed,
  className = "",
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [parsedFormat, setParsedFormat] = useState(null);
  const [history, setHistory] = useState(() => loadHistory());
  const [exampleLoading, setExampleLoading] = useState(null);

  useEffect(() => {
    setHistory(loadHistory());
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
      setHistory(addHistoryEntry(entry));
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

  const handleLoadExample = async (example) => {
    setError(null);
    setParsedFormat(null);
    setExampleLoading(example.url);
    try {
      const res = await fetch(example.url);
      if (!res.ok) throw new Error(`Failed to load example (${res.status})`);
      const text = await res.text();
      const { format, structure } = parseFileText(text);
      setParsedFormat(format);
      onStructureParsed?.({
        format,
        structure,
        fileName: `${example.symbol}_POSCAR`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExampleLoading(null);
    }
  };

  const handleDeleteFromHistory = (id) => {
    setHistory(removeHistoryEntry(id));
  };

  const handleClearHistory = () => {
    setHistory(clearHistory());
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  return (
    <div className={`pt-2 ${className}`}>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        Upload a crystal structure
      </label>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".cif,.xyz,.vasp,.poscar,.xsf,.in,.pwi"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
        }`}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-6 w-6"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M12 16V4m0 0L7 9m5-5 5 5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {file ? (
          <>
            <p className="font-medium text-slate-900">{file.name}</p>
            <p className="mt-1 text-sm text-slate-500">
              Click or drop another file to replace it
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-slate-900">
              Drop your crystal structure here
            </p>
            <p className="mt-1 text-sm text-slate-500">
              or{" "}
              <span className="font-medium text-blue-600">
                browse your files
              </span>
            </p>
            <p className="mt-3 text-xs text-slate-400">
              CIF, XYZ, POSCAR, XSF and Quantum ESPRESSO files
            </p>
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        By continuing you agree to our{" "}
        <a
          href="#terms"
          className="font-medium text-blue-600 underline-offset-2 hover:underline"
        >
          Terms of service
        </a>
      </p>

      <Modal hash="terms" title="Terms of service">
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
      </Modal>

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

      <div className="mt-5 border-t border-slate-100 pt-4">
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
          className="w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
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

      {history.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              Previously calculated structures
            </p>
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          </div>

          <ul className="space-y-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {entry.fileName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(entry.date).toLocaleString()}
                  </p>
                </div>

                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {entry.format.toUpperCase()}
                </span>

                <button
                  type="button"
                  onClick={() => handleLoadFromHistory(entry)}
                  className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                >
                  Load
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteFromHistory(entry.id)}
                  aria-label={`Delete ${entry.fileName}`}
                  className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
