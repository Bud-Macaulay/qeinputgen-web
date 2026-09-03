export default function Accordion({
  title,
  children,
  className = "",
  open,
  onToggle,
}) {
  return (
    <div
      className={`overflow-hidden rounded border border-slate-200 bg-white shadow-sm transition-shadow ${
        open ? "shadow-md" : ""
      } ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-slate-800 transition bg-blue-50 hover:bg-blue-100"
        aria-expanded={open}
      >
        <span>{title}</span>

        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-transform duration-200 ${
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

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-5 py-4 text-sm leading-6 text-slate-900">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
