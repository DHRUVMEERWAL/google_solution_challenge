"use client"

import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import AntiPiracyNotice from "@/components/anti-piracy-notice"

interface ProtectedVideoPlayerProps {
  videoUrl: string
  // thumbnail: string
  title: string
  onBack?: () => void
}

export default function ProtectedVideoPlayer({
  videoUrl,
  // thumbnail,
  title,
  onBack,
}: ProtectedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [volume, setVolume] = useState(1)
  const [isRecording, setIsRecording] = useState(true) // Block until check confirms
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    const container = document.querySelector(".video-container") as HTMLElement
    if (!isFullscreen) {
      container.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen(!isFullscreen)
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current && duration) {
      const newTime = (value[0] / 100) * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0] / 100
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  // ✅ Only this polling: checks screen recording/sharing endpoints every 3s
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const pollScreenStatus = async () => {
      try {
        const [res8000, res8001] = await Promise.all([
          fetch("http://localhost:8000/check"),
          fetch("http://localhost:8001/is_sharing_active"),
        ])

        const data8000 = await res8000.json()
        const data8001 = await res8001.json()

        const isBlocked8000 = data8000.status === "blocked"
        const isBlocked8001 = data8001.screen_sharing === true

        const isRecordingNow = isBlocked8000 || isBlocked8001

        setIsRecording(isRecordingNow)

        if (isRecordingNow) {
          videoRef.current?.pause()
        }
      } catch (err) {
        console.error("Screen status check failed:", err)
        setIsRecording(true) // fallback to block
        videoRef.current?.pause()
      }
    }

    pollScreenStatus()
    intervalId = setInterval(pollScreenStatus, 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => setDuration(video.duration)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("ended", handleEnded)

    document.addEventListener("fullscreenchange", () =>
      setIsFullscreen(!!document.fullscreenElement)
    )

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("ended", handleEnded)
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    }
  }, [])

  return (
    <div className="video-container relative h-screen w-full bg-black" onMouseMove={handleMouseMove}>
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        className={cn(
          "h-full w-full object-contain",
          isRecording && "invisible"
        )}
        // poster={thumbnail}
        onClick={togglePlay}
      />

      {/* Blocker screen */}
      {isRecording && (
        <AntiPiracyNotice onDismiss={() => {}} />
      )}

      {/* Controls */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/70 p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          isRecording && "invisible"
        )}
      >
        {/* Top controls */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-black/20" onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        {/* Center play */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {!isPlaying && !isRecording && (
            <Button
              variant="ghost"
              size="icon"
              className="h-16 w-16 rounded-full bg-black/30 text-white hover:bg-black/50"
              onClick={togglePlay}
            >
              <Play className="h-8 w-8 fill-white" />
            </Button>
          )}
        </div>

        {/* Bottom controls */}
        <div className="space-y-4">
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            onValueCommit={handleSeek}
            className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-gray-600 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-blue-500"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-black/20" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-white" />}
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-black/20" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button>

                <div className="hidden w-24 md:block">
                  <Slider
                    value={[isMuted ? 0 : volume * 100]}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-gray-600 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-blue-500"
                  />
                </div>
              </div>

              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-black/20">
                <Settings className="h-6 w-6" />
              </Button>

              <Button variant="ghost" size="icon" className="text-white hover:bg-black/20" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
