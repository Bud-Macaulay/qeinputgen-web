import "./index.css";
import MaterialsCloudHeader from "mc-react-header";
import { useState } from "react";

import CrystalUpload from "./FileUpload";
import QEInputGenerator from "./QEInputGenerator";

import Accordion from "./components/Accordion";

function App() {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [loaded, setLoaded] = useState(null);

  const handleStructureParsed = ({ structure, fileName }) => {
    setLoaded({ structure, fileName });
  };

  return (
    <>
      <MaterialsCloudHeader
        activeSection="work"
        breadcrumbsPath={[
          { name: "Work", link: "https://www.materialscloud.org/work" },
          { name: "Tools", link: "https://www.materialscloud.org/work/tools" },
          {
            name: "QE input generator",
            link: null,
          },
        ]}
      />

      <main className="min-h-screen bg-slate-50 pb-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="overflow-hidden bg-white shadow-sm">
            <div className=" pt-4 sm:px-10">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-2xl tracking-tight text-slate-900 sm:text-3xl">
                  QE input generator
                </h1>
              </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
              <div className="space-y-3">
                {/* First Accordion */}
                <Accordion
                  title="What this tool does"
                  open={openAccordion === 0}
                  onToggle={() =>
                    setOpenAccordion(openAccordion === 0 ? null : 0)
                  }
                >
                  <p className="mb-2 text-justify">
                    This tool takes as input a crystal structure (in a number of
                    different formats), and prepares an input file for a{" "}
                    <strong>PWscf code of QuantumESPRESSO</strong>, using
                    reliable standard parameters that can be used to perform a
                    self-consistent calculations for the chosen structure. It's
                    not meant to be a replacement for your own understanding,
                    but it can be used as a sanity check - in particular we
                    provide pseudopotentials that have been pre-screened using
                    the{" "}
                    <a
                      href="https://www.materialscloud.org/sssp"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SSSP protocol
                    </a>
                    , with reliable cutoffs for the charge density and the
                    wavefunctions.
                  </p>

                  <p className="mb-2">
                    In addition, there is an online visualizer that can be used
                    to study the structure that you have just chosen - it could
                    be even your own PWscf input file, to double-check a
                    structure you generated yourself.
                  </p>

                  <p class>
                    Note that we do not keep track or store any of the files you
                    upload to the service, and thus obviously we do not share or
                    disclose them to anyone - ourselves or third parties. More
                    details can be found in the Terms of Use.
                  </p>
                </Accordion>

                {/* Second accordion content */}
                <Accordion
                  title="Instructions and details"
                  open={openAccordion === 1}
                  onToggle={() =>
                    setOpenAccordion(openAccordion === 1 ? null : 1)
                  }
                >
                  <p>
                    A detailed discussion of all input parameters for PWscf can
                    be found{" "}
                    <a
                      href="https://www.quantum-espresso.org/Doc/pw.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      here
                    </a>
                    , while a more in-depth documentation is{" "}
                    <a
                      href="https://www.quantum-espresso.org/resources/users-manual"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      here
                    </a>
                    .
                  </p>
                  <p>Here, we want just a minimal setup, where you:</p>
                  <ul className="list-decimal pl-10 pt-2 space-y-1">
                    <li>Input the crystal structure.</li>
                    <li>
                      Choose a pre-defined protocol for your use case that
                      determines the pseudopotential, k-point sampling,
                      smearing, and convergence thresholds. The parameters have
                      been benchmarked by Gabriel de Miranda Nascimento et al.
                      (in preparation). See below for a table of all the
                      choices.
                    </li>
                    <li>Choose the exchange-correlation functional.</li>
                    <li>
                      Decide if you want to treat your system as a non-magnetic
                      metal (i.e. using smearing/fractional occupations), as a
                      non-magnetic insulator (i.e. using fixed occupations equal
                      to 2), or as a magnetic system (in this case, it's safer
                      to use smearing/fractional occupations, unless you know
                      what you are doing). When in doubt re metallicity, just
                      choose it and see if all states above the Fermi energy are
                      empty. When in doubt re magnetism, choose it and see if
                      the absolute magnetization is zero (note that magnetic
                      calculations are twice more expensive, more difficult to
                      converge, and there can be different self-consistent
                      states with different magnetizations - non-magnetic state,
                      ferro, anti-ferro, ferri...). For fractional occupations,
                      we are using here cold (i.e. Marzari-Vanderbilt-De
                      Vita-Payne) smearing, but note that if your system is
                      actually an insulator or a molecule a monotonic occupation
                      function (Gaussian) would be safer in a few cases (cold
                      smearing can put the Fermi energy of an insulator just
                      below the valence, and Methfessel-Paxton can put it both
                      just below the valence, or just above the conduction).
                    </li>
                    <li>
                      In the advanced settings, you can override any of inputs
                      determined by the protocol (see below).
                    </li>
                  </ul>
                  {/* Table 1 */}
                  <h3 className="text-lg py-1 pt-2 pl-2">Protocols</h3>

                  <div className="overflow-x-auto ">
                    <table className="w-full text-left text-sm border">
                      <thead className="bg-gray-100  text-gray-700">
                        <tr className="border">
                          <th scope="col" className="px-6 py-4 font-semibold">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-4 font-semibold">
                            Pseudopotential flavor
                          </th>
                          <th scope="col" className="px-6 py-4 font-semibold">
                            k-points &amp; smearing
                          </th>
                          <th scope="col" className="px-6 py-4 font-semibold">
                            Thresholds
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-300 bg-white">
                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                            fast
                          </td>
                          <td className="px-6 py-4">efficiency</td>
                          <td className="px-6 py-4">coarse</td>
                          <td className="px-6 py-4">loose</td>
                        </tr>

                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                            balanced
                          </td>
                          <td className="px-6 py-4">efficiency</td>
                          <td className="px-6 py-4">medium</td>
                          <td className="px-6 py-4">intermediate</td>
                        </tr>

                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                            stringent
                          </td>
                          <td className="px-6 py-4">precision</td>
                          <td className="px-6 py-4">fine</td>
                          <td className="px-6 py-4">tight</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table 2 */}
                  <h3 className="text-lg py-1 pt-2 pl-2">
                    k-points and smearing
                  </h3>

                  <div className="overflow-x-auto ">
                    <table className="w-full text-left text-sm border">
                      <thead className="bg-gray-100  text-gray-700">
                        <tr className="border">
                          <th scope="col" className="px-6 py-4 font-semibold">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-4 font-semibold">
                            k-point distance (1/Ang)
                          </th>
                          <th scope="col" className="px-6 py-4 font-semibold">
                            Smearing (Ry)
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-300 bg-white">
                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                            coarse
                          </td>
                          <td className="px-6 py-4">0.3</td>
                          <td className="px-6 py-4">0.0275</td>
                        </tr>

                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                            medium
                          </td>
                          <td className="px-6 py-4">0.15</td>
                          <td className="px-6 py-4">0.02</td>
                        </tr>

                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                            fine
                          </td>
                          <td className="px-6 py-4">0.1</td>
                          <td className="px-6 py-4">0.0125</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table 3 */}
                  <h3 className="text-lg py-1 pt-2 pl-2">
                    Convergence thresholds
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border">
                      <thead className="bg-gray-100  text-gray-700">
                        <tr className="border">
                          <th scope="col" className="px-6 py-4 font-semibold">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-4 font-semibold">
                            etot_conv_thr (Ry/atom)
                          </th>
                          <th scope="col" className="px-6 py-4 font-semibold">
                            forc_conv_thr (Ry/bohr)
                          </th>
                          <th scope="col" className="px-6 py-4 font-semibold">
                            &ELECTRONS conv_thr (Ry/atom)
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-300 bg-white">
                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                            loose
                          </td>
                          <td className="px-6 py-4">
                            1 · 10<sup>-4</sup>
                          </td>
                          <td className="px-6 py-4">
                            1 · 10<sup>-3</sup>
                          </td>
                          <td className="px-6 py-4">
                            4 · 10<sup>-10</sup>
                          </td>
                        </tr>

                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                            intermediate
                          </td>
                          <td className="px-6 py-4">
                            1 · 10<sup>-5</sup>
                          </td>
                          <td className="px-6 py-4">
                            1 · 10<sup>-4</sup>
                          </td>
                          <td className="px-6 py-4">
                            2 · 10<sup>-10</sup>
                          </td>
                        </tr>

                        <tr>
                          <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                            tight
                          </td>
                          <td className="px-6 py-4">
                            5 · 10<sup>-6</sup>
                          </td>
                          <td className="px-6 py-4">
                            5 · 10<sup>-5</sup>
                          </td>
                          <td className="px-6 py-4">
                            1 · 10<sup>-10</sup>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="pt-4">Some extra points of consideration:</p>
                  <ul className="list-disc pl-10 pt-2 space-y-1 text-justify">
                    <li>
                      Regarding k-point sampling: we change the smearing
                      (degauss) together with k-points grids since a coarser
                      sampling benefits from more smearing. For insulators, we
                      recommend to always use the "medium" as opposed to the
                      "fine" sampling, as they are less problematic to converge
                      with respect to the k-point sampling than metals. For
                      metals with d of f electrons (lanthanide/actinide
                      elements), the "fine" sampling is the most recommended
                      choice, as these states may introduce a sharp density of
                      states near the Fermi level that affects the
                      smearing/k-points convergence behavior. Keep in mind:
                      <strong>
                        there is no point in sampling the Brillouin Zone in a
                        direction in which there shouldn't be any dispersion (as
                        is the case for, say, a 0-, 1- or 2-dimensional system
                        where 3, 2, or 1 directions shouldn't be sampled); in
                        these cases you should update the input file by hand a
                        posteriori.
                      </strong>
                      You can also decide to use a shifted Monkhorst-Pack mesh
                      (just change 0 0 0 → 1 1 1 in the last 3 numbers of the
                      k-point entry). If you are a PWscf Jedi, for large cells
                      you could use the Baldereschi point (1/4 1/4 1/4) and
                      nosym=.true. to get much better sampling than Gamma-only
                      (at twice the cost).
                    </li>
                    <li>
                      Note that for a 'scf' calculation etot_conv_thr and
                      forc_conv_thr are not relevant (but would be a good choice
                      for a 'relax' calculation). Both energy thresholds
                      ('etot_conv_thr' and 'conv_thr') are per atom quantities,
                      so that they get scaled by the number of atoms in the
                      cell. Regarding the conv_thr, if you have 1) a lot of
                      electrons/atom, 2) planning to do a phonon calculation
                      afterwards, 3) calculating a "single-atom" property in a
                      large cell (e.g. a formation energy) you might want to
                      manually use a tighter threshold - say 2.0 · 10
                      <sup>-11</sup> times the number of atoms.
                    </li>
                    <li>
                      This tool is only a preliminary step to running a full
                      PWscf calculation (where e.g. you might want to relax the
                      atomic positions or the cell geometry, or perform more
                      complex operations). Note also that even with the
                      parameters provided the calculation is not guaranteed to
                      converge (decrease the{" "}
                      <a
                        className="text-blue-500"
                        href="https://www.quantum-espresso.org/Doc/INPUT_PW.html#idm760"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        mixing_beta
                      </a>{" "}
                      parameter, as a first remedy) or be suitable for your
                      purpose, and it's certainly not optimized for speed.
                    </li>
                    <li>
                      More complex but standardized workflows are being
                      developed, exploiting the workflow engine of{" "}
                      <a href="http://aiida.net" target="_blank">
                        AiiDA
                      </a>
                      . The{" "}
                      <a
                        href="https://www.materialscloud.org/work/quantum-mobile"
                        target="_blank"
                      >
                        Quantum Mobile
                      </a>{" "}
                      virtual machine that you can run on any computer (Windows,
                      Mac, Linux, etc...) provides an Ubuntu environment which
                      comes with Quantum ESPRESSO, AiiDA, and all the other{" "}
                      <a href="http://max-centre.eu" target="_blank">
                        MaX
                      </a>{" "}
                      codes preinstalled and ready to run. Additionally, the{" "}
                      <a
                        href="https://aiidalab-qe.readthedocs.io/"
                        target="_blank"
                      >
                        {" "}
                        AiiDAlab QE app
                      </a>
                      can be used to run standard Quantum ESPRESSO workflows.
                    </li>
                  </ul>
                </Accordion>
                <CrystalUpload onStructureParsed={handleStructureParsed} />
              </div>
            </div>

            <QEInputGenerator
              structure={loaded?.structure}
              className="max-w-6xl mx-auto py-4"
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
