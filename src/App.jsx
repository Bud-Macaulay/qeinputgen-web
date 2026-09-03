import "./index.css";
import MaterialsCloudHeader from "mc-react-header";
import { useState } from "react";

import CrystalUpload from "./FileUpload";
import SeekPath from "./SeekPath";

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
            name: "SeeK-path: the k-path finder and visualizer",
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
                  SeeK-path: the k-path finder and visualizer
                </h1>
              </div>
            </div>

            <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
              <div className="space-y-3">
                {/* First Accordion */}
                <Accordion
                  title="What SeeK-path does"
                  open={openAccordion === 0}
                  onToggle={() =>
                    setOpenAccordion(openAccordion === 0 ? null : 0)
                  }
                >
                  <div>
                    <p>
                      This tool takes in{" "}
                      <strong>input a crystal structure</strong> (in a number of
                      different formats), and
                    </p>
                    <ul className="list-disc pl-10">
                      <li>
                        finds its <strong>spacegroup</strong>;
                      </li>
                      <li>
                        computes the{" "}
                        <strong>crystallographic primitive cell</strong> (i.e.,
                        always oriented according to crystallographic standard
                        definitions);
                      </li>
                      <li>
                        computes the <strong>Brillouin zone</strong>;
                      </li>
                      <li>
                        provides <strong>interactive visualization</strong> of
                        primitive cell and Brillouin zone;
                      </li>
                      <li>
                        computes all{" "}
                        <strong>high-symmetry k-points coordinates</strong>;
                      </li>
                      <li>
                        for band structure plotting, provides a{" "}
                        <strong>complete list of high-symmetry paths</strong> in
                        the Brillouin zone going between the high-symmetry
                        k-points;
                      </li>
                      <li>
                        provides <strong>copy-paste content</strong> to input
                        the kpoints in an external code or input file.
                      </li>
                    </ul>
                    <p>
                      <div className="italic pt-4 text-center">
                        Alternatively, you can calculate and visualize an
                        example. (There is one example for each possible
                        extended Bravais symbol, both for systems with and
                        without inversion symmetry.)
                      </div>
                    </p>
                  </div>
                </Accordion>

                {/* Second accordion content */}
                <Accordion
                  title="SeeK-path definitions and advantages"
                  open={openAccordion === 1}
                  onToggle={() =>
                    setOpenAccordion(openAccordion === 1 ? null : 1)
                  }
                >
                  <p>
                    This tool follows the definitions of the{" "}
                    <a href="#hpkot">HPKOT paper</a>. The main advantages of
                    this work are:
                  </p>
                  <ul className="list-disc pl-10">
                    <li>
                      <strong>
                        use of the <em>crystallographic</em> cells
                      </strong>
                      : The conventional cell is standardized according to the
                      definitions that are standard in the field in
                      crystallography: the{" "}
                      <em>International Tables of Crystallography</em> (the
                      Tables, from here on), and{" "}
                      <em>Parthé, Gelato, Acta Cryst. A40, 169 (1984)</em>. Just
                      a couple of examples:
                      <ul className="list-[circle] pl-10">
                        <li>
                          orientation of the axes follows the standards
                          mentioned above, e.g., monoclinic cells are always{" "}
                          <em>b</em>-axis unique.
                        </li>
                        <li>
                          order of axes is imposed only when not already imposed
                          by symmetry, (following the prescriptions of Parthé
                          and Gelato). E.g., for spacegroup Pmm2 (orthorhombic),
                          the third axis is fixed by symmetry (the one with 180°
                          rotation but no mirror plane). Therefore, we only
                          impose <em>a&lt;b</em>, with no ordering imposed on{" "}
                          <em>c</em>.
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Unambiguous high-symmetry k-point labels</strong>.
                      For rational k-points, we use the same labels as the ones
                      defined in the Tables. For irrational k-points (not
                      defined in the Tables), letters are chosen so as to never
                      collide with existing letters in the Tables.
                    </li>
                    <li>
                      <strong>
                        Complete set of high-symmetry paths (band lines), using
                        also spacegroup symmetry when needed
                      </strong>
                      . For instance, spacegroup Pm-3 (cubic primitive, extended
                      Bravais lattice cP1) does not have 90° rotation
                      symmetries, so both the lines M–X and M–X<sub>1</sub> must
                      be considered.
                    </li>
                  </ul>
                  <p></p>
                </Accordion>
                <CrystalUpload onStructureParsed={handleStructureParsed} />
              </div>
            </div>

            <SeekPath
              structure={loaded?.structure}
              className="max-w-6xl mx-auto"
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
