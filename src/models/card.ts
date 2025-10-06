type Image = {
    [key: string]: string
}

export type Card = {
    [key: string]: any,
    oracle_text: string,
    type_line: string,
    colors?: string[],
    mana_produced?: string[],
    color_indicator?: string[],
    override_image?: string,
    image_uris?: Image,
    card_faces?: Card[],
}