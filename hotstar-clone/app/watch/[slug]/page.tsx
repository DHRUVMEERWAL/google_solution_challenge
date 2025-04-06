"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import ProtectedVideoPlayer from "@/components/protected-video-player"
import { useMemo } from "react"

export default function WatchPage() {
  const router = useRouter()
  const params = useParams() as { slug: string }

  const content = {
    title: params.slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    description:
      "Loki, the God of Mischief, steps out of his brother's shadow to embark on a new journey that takes him through time and space.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "/placeholder.svg?height=1080&width=1920",
  }

  const similarThumbnails = useMemo(() => {
    const thumbnails = [
      "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // Dark Knight
      "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg", // Oppenheimer
      "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg", // Last of Us
      "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg", // John Wick 4
      "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg", // Stranger Things
      "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", // Dune
      "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg", // Interstellar
      "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg", // Game of Thrones
    ]

    // Shuffle and pick 4
    return thumbnails.sort(() => 0.5 - Math.random()).slice(0, 4)
  }, [])

  return (
    <div className="min-h-screen bg-[#0f1014] text-white">
      <ProtectedVideoPlayer
        videoUrl={content.videoUrl}
        thumbnail={content.thumbnail}
        title={content.title}
        onBack={() => router.push("/")}
      />

      <div className="container py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold">{content.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
              <span>2023</span>
              <span>•</span>
              <span>HD</span>
              <span>•</span>
              <span>5.1</span>
            </div>
            <p className="mt-4 text-gray-300">{content.description}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">More Like This</h2>
            <div className="grid grid-cols-2 gap-4">
              {similarThumbnails.map((thumb, idx) => (
                <Link
                  key={idx}
                  href={`/watch/similar-content-${idx + 1}`}
                  className="group"
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={thumb}
                      alt={`Similar content ${idx + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
