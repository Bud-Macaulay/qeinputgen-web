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

            <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
              <div className="space-y-3">
                {/* First Accordion */}
                <Accordion
                  title="What this tool does"
                  open={openAccordion === 0}
                  onToggle={() =>
                    setOpenAccordion(openAccordion === 0 ? null : 0)
                  }
                >
                  <div>
                    <p>
                      This tool takes in{" "}
                      <strong>a crystal structure</strong> (in a number of
                      different formats), and
                    </p>
                    <ul className="list-disc pl-10">
                      <li>
                        analyzes it: <strong>spacegroup</strong>,{" "}
                        <strong>composition</strong> and{" "}
                        <strong>lattice parameters</strong>;
                      </li>
                      <li>
                        picks a <strong>recommended pseudopotential</strong> for
                        each element from the SSSP library;
                      </li>
                      <li>
                        lets you choose the <strong>accuracy</strong> (low,
                        medium or high), the{" "}
                        <strong>exchange-correlation functional</strong> (PBE or
                        PBEsol) and the <strong>smearing</strong> (metallic,
                        insulating or magnetic);
                      </li>
                      <li>
                        generates a complete{" "}
                        <strong>Quantum ESPRESSO pw.x input file</strong> for an
                        scf calculation, ready to run.
                      </li>
                    </ul>
                    <p>
                      <div className="italic pt-4 text-center">
                        Alternatively, you can generate the input for one of
                        the examples. (There is at least one example for each
                        type of electronic behaviour: metallic, insulating and
                        magnetic.)
                      </div>
                    </p>
                  </div>
                </Accordion>

                {/* Second accordion content */}
                <Accordion
                  title="Advantages and how it works"
                  open={openAccordion === 1}
                  onToggle={() =>
                    setOpenAccordion(openAccordion === 1 ? null : 1)
                  }
                >
                  <p>
                    The generated input follows the conventions of the SSSP
                    pseudopotential library. The main advantages of this tool
                    are:
                  </p>
                  <ul className="list-disc pl-10">
                    <li>
                      <strong>Verified pseudopotentials</strong>: the
                      recommended SSSP pseudopotential for each element and
                      functional is preselected, together with its convergence
                      cutoff.
                    </li>
                    <li>
                      <strong>Pseudopotential override</strong>: all available
                      files for an element are listed, so you can pick a
                      different one if you prefer.
                    </li>
                    <li>
                      <strong>Tunable accuracy</strong>: the low / medium / high
                      presets control the k-point spacing, the plane-wave
                      cutoff and the convergence threshold.
                    </li>
                    <li>
                      <strong>No backend needed</strong>: pseudopotential
                      metadata and files are served directly from a static
                      (S3-compatible) endpoint; only the pseudopotential
                      location is passed to the app at runtime.
                    </li>
                  </ul>
                  <p></p>
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