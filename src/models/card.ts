type Image = {
  [key: string]: string
}

interface ICardFace {
  name: string,
  printed_name?: string,
  oracle_text: string,
  printed_text?: string,
  type_line?: string,
  object: string,
  power?: string,
  toughness?: string,
  loyalty?: string,
  defense?: string,
  mana_cost: string,
  layout?: string,
  image_uris?: Image,
  oracle_id?: string,
  artist?: string,
  colors?: string[],
  color_indicator?: string[],
}

export type CardFace = ICardFace & {
}

export type EditableCardFace = CardFace & {
  stat_override?: string,
  override_image?: string,
}

interface ICard {
  name: string,
  id: string,
  oracle_id: string,
  scryfall_uri: string,
  uri: string,
  colors?: string[],
  produced_mana?: string[],
  color_indicator?: string[],
  keywords: string[],
}

export type Card = CardFace & ICard & {
  card_faces?: CardFace[],
}

export type SelectedCard = ICard & EditableCardFace & {
  internalId: number,
  card_faces?: EditableCardFace[],
}