import { useState, useEffect, useMemo, JSX } from "react";
import { Card } from "../models/card"

type Symbology = {
  symbol: String,
  svg_uri: String,
}

type LookupTable = {
  [key: string]: string
}

const manaDict = fetch("https://api.scryfall.com/symbology")
  .then((r) => r.json())
  .then((j) => {
    return Promise.resolve(
      Object.fromEntries(j.data.map((s: Symbology) => [s.symbol, s.svg_uri]))
    );
  });

function replaceSymbols(text: string, matchDict: LookupTable = {}) {
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

type MappedResult = {
  type: string,
  contents?: string,
}

function replaceAsync(text = ""): Promise<MappedResult[]> {
  return manaDict.then((d) => Promise.resolve(replaceSymbols(text, d)));
}

function displayMapped(mappedList: MappedResult[]) {
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

const useManaSymbols = (txt: string): [MappedResult[], JSX.Element | (JSX.Element | undefined)[]] => {
  const [data, setData] = useState<MappedResult[]>([]);

  const display = useMemo(() => {
    return data.length ? displayMapped(data) : <span>{txt}</span>;
  }, [data]);

  useEffect(() => {
    replaceAsync(txt).then(setData);
  }, [txt]);

  return [data, display];
};

export { manaDict, replaceAsync, displayMapped, useManaSymbols };
