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
const FALLBACK_BACKDROP = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=85"
const FALLBACK_POSTER = "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=700&q=85"

const LOCAL_MOVIES: Movie[] = [
  ["Inception", "A thief who steals secrets through dreams is offered a chance to erase his past by planting an idea in a target's mind."],
  ["RRR", "Two revolutionaries from different worlds join forces in a spectacular story of friendship, courage, and freedom."],
  ["Jalsa", "A respected journalist and a young woman are drawn into a tense mystery that changes both of their lives."],
  ["Baahubali", "An adventurous young man discovers his royal legacy and rises to reclaim a kingdom from a ruthless ruler."],
  ["Joker", "A troubled comedian's downward spiral transforms him into a criminal figure who sparks a citywide uprising."],
  ["Athadu", "A professional assassin is forced into hiding and unexpectedly finds a family while trying to clear his name."],
  ["The Dark Knight", "Batman faces a criminal mastermind whose reign of chaos pushes Gotham and its heroes to their limits."],
  ["Batman", "A masked vigilante protects Gotham while confronting the corruption and criminals threatening his city."],
  ["A Aa", "A young woman escapes a sheltered life and discovers love, family, and independence on a journey away from home."],
  ["Peddi", "A powerful story of ambition, loyalty, and conflict set against a vivid rural backdrop."],
  ["Rangasthalam", "A partially deaf mechanic takes on a corrupt village president to protect his brother and community."],
  ["They Call Him OG", "A feared gangster returns to Mumbai, reigniting old rivalries and settling unfinished scores."],
  ["Vakeel Saab", "A determined lawyer fights for three women and challenges a system that refuses to hear their truth."],
  ["Gabbar Singh", "A fearless police officer takes on a powerful local politician while bringing justice to his village."],
  ["Kushi", "Two people from different backgrounds fall in love and learn whether their relationship can survive family conflict."],
  ["Badri", "A young man falls for someone whose family and traditions force him to prove the depth of his love."],
  ["Thammudu", "A carefree young man matures into a courageous brother when his family needs him most."],
  ["Magadheera", "A warrior's love and sacrifice echo across centuries as two souls find each other again."],
  ["Chirutha", "A young man seeks justice for his father and finds purpose, danger, and love along the way."],
  ["Leo", "A quiet café owner is pulled into a violent past when old enemies begin to recognize him."],
].map(([title, overview], index) => ({
  id: -index - 1,
  title,
  year: null,
  overview,
  rating: 0,
  voteCount: 0,
  posterUrl: FALLBACK_POSTER,
  backdropUrl: FALLBACK_BACKDROP,
}))

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim()

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.TMDB_API_KEY
  const localMatches = LOCAL_MOVIES.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase()) ||
    query.toLowerCase().includes(movie.title.toLowerCase()),
  )
  if (!apiKey) {
    return NextResponse.json({ results: localMatches })
  }

  const catalogAliases: Record<string, string> = {
    inception: "Inception",
    rrr: "RRR",
    jalsa: "Jalsa",
    bahubali: "Baahubali",
    joker: "Joker",
    athadu: "Athadu",
    "dark knight": "The Dark Knight",
    batman: "Batman",
    "a aa": "A Aa",
    peddi: "Peddi",
    rangasthalam: "Rangasthalam",
    og: "They Call Him OG",
    vakeelsaab: "Vakeel Saab",
    "vakeel saab": "Vakeel Saab",
    gabbarsingh: "Gabbar Singh",
    "gabbar singh": "Gabbar Singh",
    khushi: "Kushi",
    badri: "Badri",
    tammudu: "Thammudu",
    magadheera: "Magadheera",
    chirutha: "Chirutha",
    leo: "Leo",
  }
  const searchQuery = catalogAliases[query.toLowerCase()] ?? query

  try {
    // TMDB returns up to 20 movies per page. Fetch three pages so searches can show
    // up to 60 matches instead of stopping after the first page.
    const pages = await Promise.allSettled([1, 2, 3].map(async (page) => {
      const isBearerToken = apiKey.startsWith("eyJ")
      const url = `${TMDB_BASE}/search/movie?query=${encodeURIComponent(
        searchQuery,
      )}&include_adult=false&language=en-US&page=${page}${isBearerToken ? "" : `&api_key=${apiKey}`}`
      const response = await fetch(url, {
        headers: isBearerToken ? { Authorization: `Bearer ${apiKey}` } : undefined,
        next: { revalidate: 3600 },
      })
      if (!response.ok) throw new Error(`TMDB page ${page} failed`)
      return response.json()
    }))

    const pageData = pages
      .filter((page): page is PromiseFulfilledResult<any> => page.status === "fulfilled")
      .map((page) => page.value)
    const movies = pageData.flatMap((data) => data.results ?? [])

    if (movies.length === 0) {
      return NextResponse.json({ results: localMatches })
    }

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
