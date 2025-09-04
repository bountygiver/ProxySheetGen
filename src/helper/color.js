const colorDict = {
  C: "grey",
  W: "#f2e5b8",
  U: "#a5d9ed",
  B: "#1f2427",
  R: "#b84a3a",
  G: "#a6b5a8",
};

export default function extractCardColor(card, defaultColor = "grey") {
  if (!card || !card.colors || card.colors.length == 0) {
    if (card?.type_line?.includes("Land")) {
      return extractCardColor({ colors: card.produced_mana }, defaultColor);
    }
    return defaultColor;
  }

  if (card.colors.length == 1) {
    return colorDict[card.colors[0]] ?? "pink";
  }

  return `linear-gradient(to right, ${card.colors
    .map((c) => colorDict[c])
    .filter((c) => c)
    .join(", ")})`;
}
