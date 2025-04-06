"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentSliderProps {
  title: string
}

export default function ContentSlider({ title }: ContentSliderProps) {
  const items = useMemo(() => {
    const staticItems = [
      {
        id: 1,
        title: "Oppenheimer",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ptpr0kGAckfQkJeJIt8st5dglvd.jpg",
        slug: "oppenheimer",
      },
      {
        id: 2,
        title: "The Mandalorian",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
        slug: "the-mandalorian",
      },
      {
        id: 3,
        title: "The Last of Us",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
        slug: "the-last-of-us",
      },
      {
        id: 4,
        title: "The Dark Knight",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        slug: "the-dark-knight",
      },
      {
        id: 5,
        title: "Interstellar",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
        slug: "interstellar",
      },
      {
        id: 6,
        title: "Stranger Things",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
        slug: "stranger-things",
      },
      {
        id: 7,
        title: "John Wick: Chapter 4",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
        slug: "john-wick-4",
      },
      {
        id: 8,
        title: "Doctor Strange",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/uZkNbB8isWXHMDNoIbqXvmslBMC.jpg",
        slug: "doctor-strange",
      },
      {
        id: 9,
        title: "Game of Thrones",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
        slug: "game-of-thrones",
      },
      {
        id: 10,
        title: "Dune",
        image: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
        slug: "dune",
      },
      // ... you can add more as needed
    ]

    // Shuffle array
    return [...staticItems].sort(() => 0.5 - Math.random())
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/watch/${item.slug}`}
              className="group flex-shrink-0 transition-transform duration-300 hover:scale-105"
            >
              <div className="relative h-40 w-64 overflow-hidden rounded-lg">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 p-3">
                  <h3 className="text-sm font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {item.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
