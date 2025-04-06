import Link from "next/link"
import { Search, Bell, User } from "lucide-react"
import ContentSlider from "@/components/content-slider"
import FeaturedContent from "@/components/featured-content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f1014] text-white">
      <header className="sticky top-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-blue-500">
              Hotstar
            </Link>
            <nav className="hidden md:flex">
              <ul className="flex items-center gap-6">
                <li>
                  <Link href="/" className="text-sm font-medium hover:text-blue-400">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/tv" className="text-sm font-medium hover:text-blue-400">
                    TV
                  </Link>
                </li>
                <li>
                  <Link href="/movies" className="text-sm font-medium hover:text-blue-400">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href="/sports" className="text-sm font-medium hover:text-blue-400">
                    Sports
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search"
                className="w-64 rounded-full bg-[#1f2127] pl-10 text-sm text-white placeholder:text-gray-400 focus-visible:ring-blue-500"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
              <Search className="h-5 w-5 md:hidden" />
              <Bell className="h-5 w-5 hidden md:block" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
              <User className="h-5 w-5" />
            </Button>
            <Button className="hidden bg-blue-600 text-white hover:bg-blue-700 md:inline-flex">Subscribe</Button>
          </div>
        </div>
      </header>

      <main className="pb-16">
        <FeaturedContent />

        <div className="container space-y-8 pt-8">
          <ContentSlider title="Continue Watching" />
          <ContentSlider title="Popular Shows" />
          <ContentSlider title="New Releases" />
          <ContentSlider title="Trending Movies" />
          <ContentSlider title="Sports" />
        </div>
      </main>
    </div>
  )
}

