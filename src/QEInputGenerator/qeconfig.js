// Plane-wave cutoffs (ecutwfc / ecutrho) are DERIVED from the selected
// pseudopotential (UPF) file's metadata cutoffs, not configured here.
// See effectiveCutoffs in QEInputGenerator/index.jsx.

// "fast" / "balanced" / "stringent" protocols (see the Instructions accordion):
// each combines a pseudopotential flavor, a k-point & smearing level, and a
// convergence-threshold level.
export const PROTOCOLS = {
  fast: {
    label: "Fast",
    pseudo: "eff",
    kpoints: "coarse",
    thresholds: "loose",
  },
  balanced: {
    label: "Balanced",
    pseudo: "eff",
    kpoints: "medium",
    thresholds: "intermediate",
  },
  stringent: {
    label: "Stringent",
    pseudo: "prec",
    kpoints: "fine",
    thresholds: "tight",
  },
};

// k-point sampling is coupled to smearing (degauss): a coarser grid benefits
// from more smearing.
export const KPOINTS = {
  coarse: { label: "Coarse", kspacing: 0.3, degauss: 0.0275 },
  medium: { label: "Medium", kspacing: 0.15, degauss: 0.02 },
  fine: { label: "Fine", kspacing: 0.1, degauss: 0.0125 },
};

// Convergence thresholds. etot_conv_thr and conv_thr are per-atom quantities.
export const THRESHOLDS = {
  loose: {
    label: "Loose",
    etot_conv_thr: 1e-4,
    forc_conv_thr: 1e-3,
    conv_thr: 4e-10,
  },
  intermediate: {
    label: "Intermediate",
    etot_conv_thr: 1e-5,
    forc_conv_thr: 1e-4,
    conv_thr: 2e-10,
  },
  tight: {
    label: "Tight",
    etot_conv_thr: 5e-6,
    forc_conv_thr: 5e-5,
    conv_thr: 1e-10,
  },
};

export const CONTROL_FIXED = {
  tprnfor: true,
  tstress: true,
  verbosity: "high",
};

export const SYSTEM_FIXED = {
  nosym: false,
  ibrav: 0,
};

export const FUNCTIONALS = {
  pbe: { label: "PBE" },
  pbesol: { label: "PBEsol" },
};

// Occupations / spin treatment. The smearing width (degauss) is not fixed here;
// it comes from the chosen k-point level, see KPOINTS.
export const SMEARING = {
  metallic: {
    label: "Metallic (non-magnetic)",
    system: {
      occupations: "smearing",
      smearing: "cold",
      nspin: 1,
    },
  },
  insulator: {
    label: "Insulator",
    system: {
      occupations: "fixed",
      nspin: 1,
    },
  },
  magnetic: {
    label: "Magnetic",
    system: {
      occupations: "smearing",
      smearing: "cold",
      nspin: 2,
    },
  },
};

// Remote public mirror (local copy mirrors it; override at runtime via
// window.QEINPUTGEN_PSEUDO_BASE or VITE_PSEUDO_BASE):
// https://rgw.cscs.ch/matcloud:mc-discover-sssp-public/v2.0
export const PSEUDO_BASE = `https://cors.materialscloud.org/https://rgw.cscs.ch/matcloud:mc-discover-sssp-public/v2.0`;

// Directory pw.x reads pseudopotentials from. Standard SSSP v2.0 layout: a
// top-level `pseudo/` folder holding the UPF files, so input sets generated
// here run against (and the zip download bundles into) that exact layout.
export const PSEUDO_DIR = "./pseudo/";
