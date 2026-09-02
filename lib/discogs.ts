const BASE_URL = 'https://api.discogs.com'
const USER_AGENT = 'WaxApp/1.0'
const KEY = process.env.EXPO_PUBLIC_DISCOGS_KEY
const SECRET = process.env.EXPO_PUBLIC_DISCOGS_SECRET

function getHeaders() {
    return {
        'User-Agent': USER_AGENT,
        'Authorization': `Discogs key=${KEY}, secret=${SECRET}`,
    }
}

export async function searchVinyl(query: string) {
    const res = await fetch(
        `${BASE_URL}/database/search?q=${encodeURIComponent(query)}&format=vinyl&per_page=20`,
        { headers: getHeaders() }
    )
    const data = await res.json()
    return data.results ?? []
}

export async function searchByBarcode(barcode: string) {
    const res = await fetch(
        `${BASE_URL}/database/search?barcode=${barcode}`,
        { headers: getHeaders() }
    )
    const data = await res.json()
    return data.results ?? []
}

export async function getRelease(id: number) {
    const res = await fetch(
        `${BASE_URL}/releases/${id}`,
        { headers: getHeaders() }
    )
    return res.json()
}