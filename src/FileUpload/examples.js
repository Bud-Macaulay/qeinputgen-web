// Example structures loaded on click from /public/examples.
// A small curated set covering the different smearing types.
// Stored as matsci-parse toJSON structure objects.
export const examples = [
  {
    symbol: "Si",
    label: "Si · Diamond (semiconductor)",
    family: "Semiconductors",
    url: "/examples/Si/structure.json",
  },
  {
    symbol: "GaAs",
    label: "GaAs · Zincblende (semiconductor)",
    family: "Semiconductors",
    url: "/examples/GaAs/structure.json",
  },
  {
    symbol: "Al",
    label: "Al · FCC (metal)",
    family: "Metals",
    url: "/examples/Al/structure.json",
  },
  {
    symbol: "Fe",
    label: "Fe · BCC (magnetic metal)",
    family: "Metals",
    url: "/examples/Fe/structure.json",
  },
  {
    symbol: "SrTiO3",
    label: "SrTiO₃ · Perovskite (insulator)",
    family: "Oxides",
    url: "/examples/SrTiO3/structure.json",
  },
];