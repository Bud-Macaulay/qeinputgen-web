export function formatSpaceGroupSymbol(symbol) {
  symbol = symbol.replace(/\s+/g, "");
  let nextIsSub = false;
  let nextIsNegative = false;

  return symbol.split("").map((v, index) => {
    if (v === "-") {
      nextIsNegative = true;
      return null;
    }

    if (v === "_") {
      nextIsSub = true;
      return null;
    }

    if (nextIsNegative) {
      nextIsNegative = false;
      return (
        <span className="relative inline-block" key={index}>
          <span className="absolute inset-x-0 top-[0.15em] h-0 border-t-[0.1em] border-black" />
          {v}
        </span>
      );
    }

    if (nextIsSub) {
      nextIsSub = false;
      return <sub key={index}>{v}</sub>;
    }

    return v;
  });
}