import {
  CONTROL_FIXED,
  FUNCTIONALS,
  KPOINTS,
  PSEUDO_DIR,
  PROTOCOLS,
  SMEARING,
  SYSTEM_FIXED,
  THRESHOLDS,
} from "./qeconfig";

// Products of floats (2e-10 * 3 = 6.000000000000001e-10) printed cleanly
const clean = (x) => Number(x.toPrecision(12));

/**
 * The options for matsci-parse's toPW: the pw.x scf input for `structure`
 * with the chosen protocol, functional and occupations.
 *
 * etot_conv_thr and conv_thr are per atom in the protocols (as in
 * aiida-quantumespresso and the legacy generator) and are multiplied by the
 * number of atoms; forc_conv_thr is not.
 *
 * @param {object} structure a matsci-parse Structure
 * @param {object} options
 * @param {string} options.protocol key of PROTOCOLS
 * @param {string} options.functional key of FUNCTIONALS
 * @param {string} options.smearing key of SMEARING
 * @param {{ecutwfc: number, ecutrho: number}} [options.cutoffs] Ry; 0 = left out
 * @param {Object<string, string>} options.pseudos UPF file name per element
 */
export function pwOptions(structure, { protocol, functional, smearing, cutoffs = {}, pseudos }) {
  const p = PROTOCOLS[protocol];
  const kp = KPOINTS[p.kpoints];
  const thr = THRESHOLDS[p.thresholds];
  const occupations = SMEARING[smearing];
  const nat = structure.sites.length;
  return {
    control: {
      title: `qeinputgen-web ${FUNCTIONALS[functional].label}`,
      calculation: "scf",
      pseudo_dir: PSEUDO_DIR,
      etot_conv_thr: clean(thr.etot_conv_thr * nat),
      forc_conv_thr: thr.forc_conv_thr,
      ...CONTROL_FIXED,
    },
    system: {
      ...(cutoffs.ecutwfc > 0 && { ecutwfc: parseFloat(cutoffs.ecutwfc.toFixed(1)) }),
      ...(cutoffs.ecutrho > 0 && { ecutrho: parseFloat(cutoffs.ecutrho.toFixed(1)) }),
      ...SYSTEM_FIXED,
      ...occupations.system,
      ...(occupations.system.smearing && { degauss: kp.degauss }),
    },
    electrons: {
      conv_thr: clean(thr.conv_thr * nat),
    },
    kpoints: {
      kspacing: kp.kspacing,
    },
    pseudo: { pseudos },
  };
}
