import { useState } from "react";
import { CopyIcon, CheckIcon, DownloadIcon } from "../Icons";

export default function TextRenderer({ title, text, filename = "text.txt" }) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();

    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const handleDownload = (e) => {
    e.stopPropagation();

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`w-full overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition-shadow ${
        open ? "shadow-md" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 bg-blue-50 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left font-medium text-slate-800"
          aria-expanded={open}
        >
          <span className="truncate">{title}</span>

          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M5 7.5 10 12.5 15 7.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}

            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <DownloadIcon className="h-4 w-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="max-h-[500px] overflow-auto">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-slate-900">
                {text}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
