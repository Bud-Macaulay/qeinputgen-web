export const ACCURACY = {
  low: {
    label: "Low",
    kspacing: 0.5,
    ecutwfc: 40,
    conv_thr: 1e-5,
  },
  medium: {
    label: "Medium",
    kspacing: 0.25,
    ecutwfc: 60,
    conv_thr: 1e-6,
  },
  high: {
    label: "High",
    kspacing: 0.15,
    ecutwfc: 80,
    conv_thr: 1e-7,
  },
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
      smearing: "methfessel-paxton",
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
      smearing: "methfessel-paxton",
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

export const PSEUDO_BASE =
  "https://rgw.cscs.ch/matcloud:mc-discover-sssp-public/v2.0";

export const PSEUDO_DIR = "./pseudo";