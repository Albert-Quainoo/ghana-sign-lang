import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center content-bg-1">
      <LoadingSpinner size="lg" />
    </div>
  )
}
