import Link from "next/link"
import Image from "next/image"
import { Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FeaturedContent() {
  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://image.tmdb.org/t/p/w600_and_h900_bestv2/voHUmluYmKyleFkTu3lOXQG702u.jpg"
          alt="Featured content"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>
      <div className="container relative flex h-full flex-col justify-end pb-16">
        <div className="max-w-lg space-y-4">
          <h1 className="text-4xl font-bold">Loki: Season 2</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="rounded bg-gray-700 px-2 py-1">2023</span>
            <span>Fantasy</span>
            <span>Adventure</span>
            <span>6 Episodes</span>
          </div>
          <p className="text-gray-300">
            Loki, the God of Mischief, steps out of his brother's shadow to embark on a new journey that takes him
            through time and space.
          </p>
          <div className="flex gap-4">
            <Button asChild className="gap-2 bg-white text-black hover:bg-gray-200">
              <Link href="/watch/loki-season-2">
                <Play className="h-4 w-4 fill-black" />
                Watch Now
              </Link>
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-white text-white bg-white/10 hover:bg-white/10 hover:text-black hover:border-white"
            >
              <Info className="h-4 w-4" />
              More Info
            </Button>

          </div>
        </div>
      </div>
    </div>
  )
}

