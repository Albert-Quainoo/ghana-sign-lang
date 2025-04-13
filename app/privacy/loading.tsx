import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center content-bg-1">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground">Loading privacy policy...</p>
    </div>
  )
}
