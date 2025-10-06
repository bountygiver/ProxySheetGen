import { CardFace, Card } from "../models/card"

export const colorDict: { [key: string]: string } = {
  C: "grey",
  W: "#f2e5b8",
  U: "#a5d9ed",
  B: "#1f2427",
  R: "#b84a3a",
  G: "#539155",
};

export default function extractCardColor(card: CardFace | Card, defaultColor = "grey") {
  if (!card || !card.colors || card.colors.length == 0) {
    if (card?.type_line?.includes("Land") && (card as Card).produced_mana?.length) {
      return extractCardColor({ ...card, colors: (card as Card).produced_mana }, defaultColor);
    }
    return defaultColor;
  }

  if (card.colors.length == 1) {
    return colorDict[card.colors[0]] ?? defaultColor;
  }

  return `linear-gradient(to right, ${card.colors
    .map((c) => colorDict[c])
    .filter((c) => c)
    .join(", ")})`;
}
