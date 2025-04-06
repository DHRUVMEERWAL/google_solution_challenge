export default function AntiPiracyNotice({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 text-white text-center px-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Screen Recording Detected</h2>
        <p className="mb-6">For security reasons, playback has been paused.</p>
      </div>
    </div>
  )
}
