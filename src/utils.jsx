import { getElement, kpointsToPW } from "matsci-parse";

export const prettify = (label) =>
  label
    .replace(/GAMMA/g, "\u0393")
    .replace(/SIGMA_0/g, "\u03A3")
    .replace(/-/g, "\u2013")
    .replace(/_/g, "\u2081");

export function formatSpaceGroupSymbol(symbol) {
  symbol = symbol.replace(/\s+/g, "");
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

// The pw.x crystal_b card declares nks globally on line 2, but the number of
// k-points generated per segment is actually taken from each vertex's weight
// (the 4th column). matsci-parse writes every weight as 1, which would make
// the band path sparse, so we rewrite the weights here.
function withBandWeights(kpointsText, pointsPerLine) {
  const block = kpointsText.split("\n");
  if (block.length < 3 || !/^K_POINTS\b/i.test(block[0])) {
    return kpointsText;
  }
  const header = block[0];
  const coordinates = block.slice(2);
  // nks is the number of supplied high-symmetry points (vertices), not the
  // points per segment — the density is instead given by each vertex's weight.
  const nksLine = String(coordinates.length);
  const weighted = coordinates.map((line, i) => {
    const tokens = line.trim().split(/\s+/);
    if (tokens.length < 3) return line;
    tokens[3] = String(i === coordinates.length - 1 ? 1 : pointsPerLine);
    return tokens.join(" ");
  });
  return [header, nksLine, ...weighted].join("\n");
}

export function preparePWText(structure, kpoints, pointsPerLine) {
  if (!structure) return "";

  const sites = structure.sites ?? [];
  const basis = structure.lattice?.basis?.data ?? [];

  const speciesOrder = [];
  for (const site of sites) {
    const symbol = site.species?.symbol;
    if (symbol && !speciesOrder.includes(symbol)) {
      speciesOrder.push(symbol);
    }
  }

  const nat = sites.length;
  const ntyp = speciesOrder.length;

  const lines = [];

  lines.push("&CONTROL");
  lines.push("  calculation = 'bands'");
  lines.push("/");
  lines.push("");

  lines.push("&SYSTEM");
  lines.push("  ibrav = 0");
  lines.push(`  nat = ${nat}`);
  lines.push(`  ntyp = ${ntyp}`);
  lines.push("  <...>");
  lines.push("/");
  lines.push("");

  lines.push("&ELECTRONS");
  lines.push("  <...>");
  lines.push("/");
  lines.push("");

  lines.push("ATOMIC_SPECIES");
  for (const symbol of speciesOrder) {
    const element = getElement(symbol);
    const mass = element?.mass ?? 0;
    lines.push(`  ${symbol}  ${mass.toFixed(2)}  <PSEUDO_HERE>.UPF`);
  }
  lines.push("");

  lines.push(
    withBandWeights(kpointsToPW(kpoints, pointsPerLine), pointsPerLine),
  );
  lines.push("");

  lines.push("CELL_PARAMETERS angstrom");
  for (let r = 0; r < 3; r++) {
    const i = r * 3;
    lines.push(`  ${basis[i]}  ${basis[i + 1]}  ${basis[i + 2]}`);
  }
  lines.push("");

  lines.push("ATOMIC_POSITIONS crystal");
  for (const site of sites) {
    lines.push(
      `  ${site.species.symbol}  ${site.frac[0].toFixed(8)}  ${site.frac[1].toFixed(8)}  ${site.frac[2].toFixed(8)}`,
    );
  }

  return lines.join("\n");
}
