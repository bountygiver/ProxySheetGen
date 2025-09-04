import { useState, useEffect, useMemo, useCallback } from "react";

const manaDict = fetch("https://api.scryfall.com/symbology")
  .then((r) => r.json())
  .then((j) => {
    return Promise.resolve(
      Object.fromEntries(j.data.map((s) => [s.symbol, s.svg_uri]))
    );
  });

function replaceSymbols(text, matchDict = {}) {
  if (!text) return [];
  const re = /\{.+?\}/gm;
  const matcher = [...text.matchAll(re)];
  const results = [];
  let startIdx = 0;
  for (let idx = 0; idx < matcher.length; ++idx) {
    if (matcher[idx].index != startIdx) {
      results.push({
        type: "text",
        contents: text.slice(startIdx, matcher[idx].index),
      });
    }
    if (matchDict[matcher[idx][0]]) {
      results.push({ type: "symbol", contents: matchDict[matcher[idx][0]] });
    } else {
      results.push({
        type: "text",
        contents: matcher[idx][0],
      });
    }
    startIdx = matcher[idx].index + matcher[idx][0].length;
  }
  if (startIdx < text.length) {
    results.push({
      type: "text",
      contents: text.slice(startIdx, text.length),
    });
  }
  return results.flatMap((f) =>
    f.type == "text"
      ? f.contents
          .split("\n")
          .flatMap((t) => {
            return [{ type: "text", contents: t }, { type: "break" }];
          })
          .flat()
          .slice(0, -1)
      : f
  );
}

function replaceAsync(text = "") {
  return manaDict.then((d) => Promise.resolve(replaceSymbols(text, d)));
}

function displayMapped(mappedList) {
  return (
    mappedList?.map((t, i) => {
      switch (t.type) {
        case "break":
          return <br key={i} />;
        case "text":
          return <span key={i}>{t.contents}</span>
        case "symbol":
          return <img className="inline-symbols" key={i} src={t.contents} />
      }
    }) ?? []
  );
}

const useManaSymbols = (txt) => {
  const [data, setData] = useState([]);

  const display = useMemo(() => {
    return data.length ? displayMapped(data) : <span>{txt}</span>;
  }, [data]);

  useEffect(() => {
    replaceAsync(txt).then(setData);
  }, [txt]);

  return [data, display];
};

export { manaDict, replaceAsync, displayMapped, useManaSymbols };
