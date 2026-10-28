import { McStructureUpload } from "mc-react-library";

import { examples } from "./examples";

const EXAMPLES = examples.map((example) => ({
  ...example,
  fileName: `${example.symbol}.json`,
}));

export default function CrystalStructureUpload(props) {
  return (
    <McStructureUpload
      historyKey="qeinputgen.parsedStructures"
      historyTitle="Your previously loaded structures"
      examples={EXAMPLES}
      {...props}
    />
  );
}
