import { NextRequest, NextResponse } from "next/server"

const BASE_METADATA_URI = "https://craig-communications-artists-then.trycloudflare.com/api/metadata"

    export async function GET(req: NextRequest) {
    const tokenId = req.nextUrl.searchParams.get("tokenId")

    if (!tokenId) {
        return NextResponse.json({ error: "Missing tokenId" }, { status: 400 })
    }

    try {
        const url = `${BASE_METADATA_URI}/${tokenId}`
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`Metadata fetch failed with status ${response.status}`)
        }
        const metadata = await response.json()
        return NextResponse.json(metadata)
    } catch (error) {
        console.error("Error fetching metadata:", error)
        return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
    }
}
