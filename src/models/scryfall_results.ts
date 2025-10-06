import { Card } from './card'

export type ScryfallResults = {
    has_more: boolean,
    next_page?: string,
    not_found?: [],
    data: Card[],
    total_cards?: number,
}