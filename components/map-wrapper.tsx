"use client"

import dynamic from "next/dynamic"
import { Memory, CurrentUser } from "@/app/page"

interface MapWrapperProps {
  memories: Memory[]
  currentUser: CurrentUser | null
  selectedLocation: { lat: number; lng: number; place?: string } | null
  onMapClick: (lat: number, lng: number) => void
  onLocationSelect: (lat: number, lng: number, place: string) => void
  onAddMemory: () => void
  onViewMemory: (memory: Memory) => void
  onClearSelection: () => void
}

const MapViewInner = dynamic(
  () => import("./map-view-inner").then((mod) => mod.MapViewInner),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 top-[54px] bg-ink flex items-center justify-center">
        <div className="text-muted-color text-sm font-serif">Loading map...</div>
      </div>
    ),
  }
)

export function MapWrapper(props: MapWrapperProps) {
  return <MapViewInner {...props} />
}
