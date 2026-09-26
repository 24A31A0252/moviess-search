import { Star, Film } from "lucide-react"
import type { Movie } from "@/app/api/search/route"

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/60">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-secondary">
        {movie.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.posterUrl || "/placeholder.svg"}
            alt={`Poster for ${movie.title}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Film className="h-10 w-10" aria-hidden="true" />
          </div>
        )}
        {movie.rating > 0 && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-background/85 px-2 py-1 text-xs font-medium backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden="true" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-pretty text-sm font-semibold leading-snug">{movie.title}</h3>
        {movie.year && <p className="text-xs text-muted-foreground">{movie.year}</p>}
        {movie.overview && (
          <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{movie.overview}</p>
        )}
      </div>
    </article>
  )
}
