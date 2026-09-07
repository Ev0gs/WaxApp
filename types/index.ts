export type VinylRecord = {
    id: string
    user_id: string
    discogs_id: number
    title: string
    artist: string
    year: number
    label: string
    country: string
    cover_url: string
    genres: string[]
    added_at: string
}

export type Track = {
    position: string
    title: string
    duration: string
}

export type DiscogsSearchResult = {
    id: number
    title: string
    year: number
    thumb: string
    cover_image: string
    country: string
    label: string[]
    genre: string[]
    format: string[]
    type: string
}