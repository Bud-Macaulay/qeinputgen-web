// ─────────────────────────────────────────────────────────────────────────────
// RemoteStructureLoader.jsx — single-file drop-in component.
//
// Copy this file into any React project, `npm i matsci-parse`, and render:
//
//   <RemoteStructureLoader onLoaded={({ structure, format, fileName }) => ...} />
//
// Reads `?fromURL=…&format=optimade|aiida` from the address bar (plain
// window.location — no router needed; `fromURL`/`format` props override),
// fetches the endpoint, and converts it with matsci-parse (`fromOptimade` /
// `fromStructureData`). Renders nothing; results go through `onLoaded`.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from "react";
import { fromOptimade, fromStructureData } from "matsci-parse";

// Short hash for a backend URL: the first block of the AiiDA node UUID
// (`0e06f528-…` → `0e06f528`), or null when the URL carries no UUID.
export function shortHashForUrl(url) {
  const uuid = String(url).match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
  )?.[0];
  return uuid ? uuid.split("-")[0] : null;
}
function aiidaPayload(doc) {
  // Raw StructureData, or inside an AiiDA REST envelope
  // (/contents/attributes → { data: { attributes: {...} } }).
  return doc?.data?.attributes ?? doc?.data ?? doc;
}

function optimadeResource(doc) {
  const data = doc?.data ?? doc;
  return Array.isArray(data) ? data[0] : data;
}

export default function RemoteStructureLoader({
  onLoaded,
  onError,
  fromURL,
  format,
  autoLoad = true,
}) {
  useEffect(() => {
    if (!autoLoad) return;
    const params = new URLSearchParams(window.location.search);
    const url = fromURL ?? params.get("fromURL");
    if (!url) return;
    const fmt = format ?? params.get("format");

    const nameTag = params.get("tag");

    fetch(url)
      .then((res) => res.json())
      .then((doc) => {
        const result =
          fmt === "optimade"
            ? { structure: fromOptimade(optimadeResource(doc)), format: fmt }
            : {
                structure: fromStructureData(aiidaPayload(doc)),
                format: "aiida",
              };
        // Prefer the AiiDA node UUID prefix (e.g. `0e06f528`) over the last
        // path segment (which is usually just `attributes`).
        const fileName =
          nameTag ??
          shortHashForUrl(url) ??
          new URL(url).pathname.split("/").filter(Boolean).pop() ??
          url;
        onLoaded?.({ ...result, fileName, sourceUrl: url });
      })
      .catch((err) =>
        onError?.(err instanceof Error ? err.message : String(err)),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
