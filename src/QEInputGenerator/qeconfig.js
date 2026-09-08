export const ACCURACY = {
  low: {
    label: "Low",
    kspacing: 0.3,
    ecutwfc: 40,
    conv_thr: 1e-5,
    etot_conv_thr: 2e-4,
    forc_conv_thr: 1e-3,
  },
  medium: {
    label: "Medium",
    kspacing: 0.15,
    ecutwfc: 60,
    conv_thr: 1e-6,
    etot_conv_thr: 2e-5,
    forc_conv_thr: 1e-4,
  },
  high: {
    label: "High",
    kspacing: 0.1,
    ecutwfc: 80,
    conv_thr: 1e-7,
    etot_conv_thr: 1e-5,
    forc_conv_thr: 5e-5,
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

export const SMEARING = {
  metallic: {
    label: "Metallic (non-magnetic)",
    system: {
      occupations: "smearing",
      smearing: "cold",
      degauss: 0.02,
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
      degauss: 0.02,
      nspin: 2,
    },
  },
};

export const ACCURACY_PSEUDO_TIER = {
  low: "eff",
  medium: "eff",
  high: "prec",
};

// Remote public mirror (local copy mirrors it; override at runtime via
// window.QEINPUTGEN_PSEUDO_BASE or VITE_PSEUDO_BASE):
// https://rgw.cscs.ch/matcloud:mc-discover-sssp-public/v2.0
export const PSEUDO_BASE = `https://cors.materialscloud.org/https://rgw.cscs.ch/matcloud:mc-discover-sssp-public/v2.0`;

export const PSEUDO_DIR = ".";
