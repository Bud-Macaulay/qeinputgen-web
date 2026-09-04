import { useEffect, useState } from "react";

const MODAL_HASH_PREFIX = "#";

function getHash() {
  const raw = typeof window !== "undefined" ? window.location.hash : "";
  return raw.startsWith(MODAL_HASH_PREFIX) ? raw.slice(1) : raw;
}

/**
 * A modal whose visibility is driven by a URL hash fragment, e.g. `#terms`.
 * Setting the hash to match `hash` (or `hash/#modal`) opens it; clearing the
 * hash (or navigating to a different hash) closes it. Passing `open`/`onClose`
 * overrides hash-driven control, e.g. for in-page toggles.
 */
export default function Modal({
  hash,
  open: openProp,
  onClose,
  title,
  children,
  maxWidth = "max-w-3xl",
}) {
  const [openInternal, setOpenInternal] = useState(() => getHash() === hash);

  useEffect(() => {
    if (openProp !== undefined) return;
    const syncFromHash = () => setOpenInternal(getHash() === hash);
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [hash, openProp]);

  const controlled = openProp !== undefined;
  const open = controlled ? openProp : openInternal;

  const close = () => {
    if (onClose) {
      onClose();
      return;
    }
    if (getHash() === hash) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    setOpenInternal(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={close}
    >
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-xl bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-slate-500 transition hover:bg-slate-100"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-auto px-5 py-4 text-sm leading-6 text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
}
