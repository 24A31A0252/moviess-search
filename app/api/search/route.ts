import { type NextRequest, NextResponse } from "next/server"

export type Movie = {
  id: number
  title: string
  year: string | null
  overview: string
  rating: number
  voteCount: number
  posterUrl: string | null
  backdropUrl: string | null
}

const TMDB_BASE = "https://api.themoviedb.org/3"
const IMG_BASE = "https://image.tmdb.org/t/p"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim()

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Movie search is not configured. Please add a TMDB_API_KEY." },
      { status: 500 },
    )
  }

  try {
    const pages = await Promise.all([1, 2].map((page) => {
      const url = `${TMDB_BASE}/search/movie?query=${encodeURIComponent(
        query,
      )}&include_adult=false&language=en-US&page=${page}&api_key=${apiKey}`
      return fetch(url, { next: { revalidate: 3600 } })
    }))

    if (pages.some((res) => !res.ok)) {
      return NextResponse.json(
        { error: "Failed to reach the movie database." },
        { status: 502 },
      )
    }

    const pageData = await Promise.all(pages.map((res) => res.json()))
    const movies = pageData.flatMap((data) => data.results ?? [])

    const results: Movie[] = movies.slice(0, 30).map((m: any) => ({
      id: m.id,
      title: m.title,
      year: m.release_date ? String(m.release_date).slice(0, 4) : null,
      overview: m.overview ?? "",
      rating: Math.round((m.vote_average ?? 0) * 10) / 10,
      voteCount: m.vote_count ?? 0,
      posterUrl: m.poster_path ? `${IMG_BASE}/w500${m.poster_path}` : null,
      backdropUrl: m.backdrop_path ? `${IMG_BASE}/w780${m.backdrop_path}` : null,
    }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while searching." },
      { status: 500 },
    )
  }
}
