import { useRef, useState } from "react";

export default function CrystalStructureUpload() {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
        Upload a crystal structure
      </label>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".cif,.xyz,.vasp,.poscar"
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
              CIF, XYZ, POSCAR and VASP files
            </p>
          </>
        )}
      </button>
    </div>
  );
}
