import { Clapperboard } from "lucide-react"
import { MovieSearch } from "@/components/movie-search"

export default function Page() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4">
          <Clapperboard className="h-6 w-6 text-primary" aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight">Simply Movies</span>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:pt-20">
        <div className="mb-10 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Find your next <span className="text-primary">watch</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            Search a huge catalog of films and instantly see posters, ratings, and what they&apos;re about.
          </p>
        </div>

        <MovieSearch />
      </section>
    </main>
  )
}
