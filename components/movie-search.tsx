"use client"

import { useState } from "react"
import useSWR from "swr"
import { Search, Loader2, Film, Clapperboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MovieCard } from "@/components/movie-card"
import type { Movie } from "@/app/api/search/route"

type SearchResponse = { results?: Movie[]; error?: string }

const fetcher = async (url: string): Promise<SearchResponse> => {
  const res = await fetch(url)
  const data = (await res.json()) as SearchResponse
  if (!res.ok) throw new Error(data.error ?? "Search failed")
  return data
}

const SUGGESTIONS = ["Inception", "Interstellar", "The Dark Knight", "RRR", "Joker"]

export function MovieSearch() {
  const [input, setInput] = useState("")
  const [query, setQuery] = useState("")

  const { data, error, isLoading } = useSWR(
    query ? `/api/search?q=${encodeURIComponent(query)}` : null,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true },
  )

  const results = data?.results ?? []
  const hasSearched = query.length > 0

  function submit(value: string) {
    const v = value.trim()
    setInput(v)
    setQuery(v)
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search for a movie..."
            aria-label="Search for a movie"
            className="h-12 w-full rounded-full border border-border bg-card pl-12 pr-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 rounded-full px-7 text-base font-medium">
          Search
        </Button>
      </form>

      <div className="mx-auto mt-4 flex max-w-xl flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground transition-colors hover:border-primary/60 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
            <p className="text-sm">Searching the archives…</p>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-xl border border-destructive/40 bg-destructive/10 px-6 py-8 text-center">
            <p className="text-sm text-foreground">{(error as Error).message}</p>
          </div>
        )}

        {!isLoading && !error && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Film className="h-10 w-10" aria-hidden="true" />
            <p className="text-base">
              No matches for <span className="font-medium text-foreground">{`"${query}"`}</span>
            </p>
            <p className="text-sm">Try a different title.</p>
          </div>
        )}

        {!error && results.length > 0 && (
          <>
            <p className="mb-5 text-sm text-muted-foreground">
              Showing {results.length} movie{results.length === 1 ? "" : "s"} for{" "}
              <span className="font-medium text-foreground">{`"${query}"`}</span>
              <span className="ml-2 text-xs text-muted-foreground">(up to 60 matches)</span>
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}

        {!hasSearched && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Clapperboard className="h-12 w-12 text-primary" aria-hidden="true" />
            <p className="text-base">Search thousands of films to get posters, ratings, and overviews.</p>
          </div>
        )}
      </div>
    </div>
  )
}
