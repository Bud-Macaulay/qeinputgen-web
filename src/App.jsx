import "./index.css";
import MaterialsCloudHeader from "mc-react-header";
import { useState } from "react";

import InfoAccordions from "./AccordionContent";
import CrystalUpload from "./FileUpload";
import QEInputGenerator from "./QEInputGenerator";

import { McAppHeader, McShareButton, toStructureShare } from "mc-react-library";

// kv-store for share links. .env.development points `pnpm dev` at the dev
// store; unset (production builds) means the Materials Cloud production store.
const KV_URL = import.meta.env.VITE_KV_URL;

function App() {
  // { structure, fileName, format, shareId? }
  const [loaded, setLoaded] = useState(null);

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

      <main className="min-h-screen bg-[aliceblue] pb-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="overflow-hidden bg-white p-4 shadow-sm">
            <McAppHeader
              title="Quantum ESPRESSO input generator and structure visualizer"
              logo={`${import.meta.env.BASE_URL}qe-logo.png`}
              logoAlt="Quantum ESPRESSO input generator logo"
            />

            <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
              <div className="space-y-3">
                <InfoAccordions />
                <CrystalUpload kvUrl={KV_URL} onStructureParsed={setLoaded} />
              </div>
            </div>

            <QEInputGenerator
              structure={loaded?.structure}
              className="max-w-6xl mx-auto py-4"
            />
            <McShareButton
              kvUrl={KV_URL}
              data={loaded}
              toDocument={toStructureShare}
              shareId={loaded?.shareId}
              className="mx-auto max-w-6xl px-6 sm:px-10"
            />
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
