"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Memory, CurrentUser } from "@/app/page"

interface MapViewProps {
  memories: Memory[]
  currentUser: CurrentUser | null
  selectedLocation: { lat: number; lng: number; place?: string } | null
  onMapClick: (lat: number, lng: number) => void
  onLocationSelect: (lat: number, lng: number, place: string) => void
  onAddMemory: () => void
  onViewMemory: (memory: Memory) => void
  onClearSelection: () => void
}

export function MapViewInner({
  memories,
  currentUser,
  selectedLocation,
  onMapClick,
  onLocationSelect,
  onAddMemory,
  onViewMemory,
  onClearSelection,
}: MapViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedMarkerRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletRef = useRef<any>(null)
  const initStartedRef = useRef(false)
  const onMapClickRef = useRef(onMapClick)
  const [isMapReady, setIsMapReady] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ lat: number; lng: number; label: string }[]>([])
  const [showResults, setShowResults] = useState(false)
  const [placeName, setPlaceName] = useState("")

  // Keep callback ref updated
  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])

  // Initialize map - dynamically import Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || initStartedRef.current) return
    initStartedRef.current = true



    const initMap = async () => {
      try {
        const leaflet = await import("leaflet")
        await import("leaflet/dist/leaflet.css")
        leafletRef.current = leaflet.default

        // Double-check container still exists and map hasn't been created
        if (!mapContainerRef.current || mapRef.current) return

        const map = leaflet.default.map(mapContainerRef.current, {
          center: [30, 10],
          zoom: 3,
          zoomControl: true,
          attributionControl: false,
        })

        leaflet.default.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          crossOrigin: "anonymous",
        }).addTo(map)

        map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
          onMapClickRef.current(e.latlng.lat, e.latlng.lng)
        })

        mapRef.current = map
        setIsMapReady(true)
      } catch {
        initStartedRef.current = false
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      initStartedRef.current = false
    }
  }, [])

  // Handle selected location marker
  useEffect(() => {
    const map = mapRef.current
    const leaflet = leafletRef.current
    if (!map || !leaflet || !isMapReady) return

    // Remove previous selected marker
    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove()
      selectedMarkerRef.current = null
    }

    if (selectedLocation) {
      
      // Create a pulsing marker for selected location
      const el = document.createElement("div")
      el.className = "selected-pin"
      el.innerHTML = `
        <div class="pin-center"></div>
        <div class="pin-pulse"></div>
      `

      const icon = leaflet.divIcon({
        html: el.outerHTML,
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = leaflet.marker([selectedLocation.lat, selectedLocation.lng], { icon }).addTo(map)
      selectedMarkerRef.current = marker

      // Reverse geocode to get place name
      if (!selectedLocation.place) {
        fetch(`https://photon.komoot.io/reverse?lon=${selectedLocation.lng}&lat=${selectedLocation.lat}&limit=1`)
          .then((r) => r.json())
          .then((data) => {
            const f = data.features?.[0]
            if (f) {
              const p = f.properties
              const name = [p.name, p.city || p.county, p.country].filter(Boolean).join(", ")
              setPlaceName(name || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`)
            } else {
              setPlaceName(`${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`)
            }
          })
          .catch(() => {
            setPlaceName(`${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`)
          })
      } else {
        setPlaceName(selectedLocation.place)
      }

      // Center map on selected location with zoom (delay to avoid re-trigger)
      setTimeout(() => {
        if (mapRef.current && selectedLocation) {
          const currentZoom = mapRef.current.getZoom()
          const targetZoom = Math.max(currentZoom, 10)
          mapRef.current.setView([selectedLocation.lat, selectedLocation.lng], targetZoom, { animate: true })
        }
      }, 50)
    } else {
      setPlaceName("")
    }
  }, [selectedLocation, isMapReady])

  // Create marker function
  const createMarkerElement = useCallback((isOwn: boolean) => {
    const el = document.createElement("div")
    el.className = `gc-pin ${isOwn ? "mine" : ""}`
    return el
  }, [])

  // Handle memory markers
  useEffect(() => {
    const map = mapRef.current
    const leaflet = leafletRef.current
    if (!map || !leaflet || !isMapReady) return

    const currentMarkers = markersRef.current

    // Remove old markers that are no longer in memories
    const memoryIds = new Set(memories.map((m) => m.id))
    currentMarkers.forEach((marker, id) => {
      if (!memoryIds.has(id)) {
        marker.remove()
        currentMarkers.delete(id)
      }
    })

    // Add or update markers
    memories.forEach((mem) => {
      if (currentMarkers.has(mem.id)) return // Already exists

      const isOwn = currentUser?.id === mem.user_id
      const el = createMarkerElement(isOwn)
      const icon = leaflet.divIcon({
        html: el.outerHTML,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      const marker = leaflet.marker([mem.lat, mem.lng], { icon }).addTo(map)

      const excerpt = mem.text.length > 100 ? mem.text.slice(0, 100) + "..." : mem.text
      const popupContent = `
        <div class="pop-content">
          <div class="pop-inmem">In memory of ${escapeHtml(mem.person_name)}</div>
          <div class="pop-by">by ${escapeHtml(mem.author_name || "someone")}</div>
          <div class="pop-excerpt">${escapeHtml(excerpt)}</div>
          <button class="pop-open" data-memory-id="${mem.id}">Read more</button>
        </div>
      `

      const popup = leaflet.popup({ maxWidth: 250 }).setContent(popupContent)
      marker.bindPopup(popup)

      marker.on("click", (e: { originalEvent: Event }) => {
        e.originalEvent.stopPropagation()
        marker.openPopup()
      })

      currentMarkers.set(mem.id, marker)
    })
  }, [memories, currentUser, createMarkerElement, isMapReady])

  // Handle popup button clicks
  useEffect(() => {
    const handlePopupClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains("pop-open")) {
        const memoryId = target.dataset.memoryId
        const memory = memories.find((m) => m.id === memoryId)
        if (memory) {
          mapRef.current?.closePopup()
          onViewMemory(memory)
        }
      }
    }

    document.addEventListener("click", handlePopupClick)
    return () => document.removeEventListener("click", handlePopupClick)
  }, [memories, onViewMemory])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5&lang=en`
      )
      const data = await response.json()
      const features = data.features || []

      const results = features.map((f: { geometry: { coordinates: number[] }; properties: { name?: string; city?: string; county?: string; country?: string } }) => {
        const coords = f.geometry.coordinates
        const p = f.properties
        const label = [p.name, p.city || p.county, p.country].filter(Boolean).join(", ")
        return { lat: coords[1], lng: coords[0], label }
      })

      setSearchResults(results)
      setShowResults(true)
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
      setShowResults(true)
    }
  }

  const handleResultClick = (result: { lat: number; lng: number; label: string }) => {
    mapRef.current?.setView([result.lat, result.lng], 15)
    setSearchQuery("")
    setShowResults(false)
    onLocationSelect(result.lat, result.lng, result.label)
  }

  return (
    <div className="fixed inset-0 top-[54px]">
      <div ref={mapContainerRef} className="w-full h-full map-container" />

      {/* Search */}
      <div className="fixed top-[66px] left-1/2 -translate-x-1/2 z-[300] w-[320px] max-w-[88vw]">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (!e.target.value.trim()) setShowResults(false)
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search any city, street or place..."
            className="w-full bg-[rgba(13,15,38,0.97)] border border-border rounded text-star font-sans text-[0.93rem] py-2.5 pl-3.5 pr-10 outline-none transition-colors shadow-[0_4px_24px_rgba(0,0,0,0.5)] placeholder:text-muted-color placeholder:italic focus:border-dim"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-amber text-[0.95rem] p-1"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
        </div>

        {showResults && (
          <div className="bg-[rgba(13,15,38,0.98)] border border-border border-t-0 rounded-b max-h-[200px] overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="py-2.5 px-3.5 text-[0.87rem] text-muted-color">No results found</div>
            ) : (
              searchResults.map((result, i) => (
                <div
                  key={i}
                  onClick={() => handleResultClick(result)}
                  className="py-2.5 px-3.5 cursor-pointer text-[0.87rem] text-text border-b border-[rgba(255,255,255,0.04)] transition-colors hover:bg-soft hover:text-star"
                >
                  {result.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>



      {/* Legend */}
      <div className="fixed bottom-14 left-4 z-[200] bg-[rgba(13,15,38,0.92)] border border-border rounded py-2.5 px-3.5 text-[0.7rem] text-muted-color leading-8">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber" />
          {"Someone's memory"}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green" />
          Your memory
        </div>
      </div>

      <style jsx global>{`
        .map-container {
          background: #07080f !important;
          cursor: crosshair !important;
        }
        .leaflet-container {
          background: #07080f !important;
          cursor: crosshair !important;
        }
        .leaflet-tile {
          filter: brightness(0.38) saturate(0.4) hue-rotate(195deg) contrast(1.2);
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(232, 168, 76, 0.16) !important;
          border-radius: 3px !important;
        }
        .leaflet-control-zoom a {
          background: #0d0f26 !important;
          color: #e8a84c !important;
          border-color: rgba(232, 168, 76, 0.16) !important;
          line-height: 26px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1c1f3d !important;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
        .leaflet-popup-content-wrapper {
          background: #0d0f26 !important;
          border: 1px solid rgba(232, 168, 76, 0.16) !important;
          border-radius: 4px !important;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7) !important;
        }
        .leaflet-popup-tip {
          background: #0d0f26 !important;
        }
        .leaflet-popup-content {
          margin: 16px 18px !important;
          font-family: var(--font-crimson), Georgia, serif !important;
          color: #c8b98a !important;
        }
        .leaflet-popup-close-button {
          color: rgba(200, 185, 138, 0.4) !important;
          font-size: 1rem !important;
        }
        .leaflet-popup-close-button:hover {
          color: #e8a84c !important;
          background: transparent !important;
        }
        .pop-inmem {
          font-size: 0.67rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #e8a84c;
          margin-bottom: 4px;
          font-family: var(--font-cormorant), Georgia, serif;
        }
        .pop-by {
          font-size: 0.78rem;
          color: rgba(200, 185, 138, 0.4);
          margin-bottom: 8px;
          font-style: italic;
        }
        .pop-excerpt {
          font-size: 0.9rem;
          color: #f0e4c8;
          line-height: 1.5;
          margin-bottom: 10px;
        }
        .pop-open {
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #e8a84c;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-cormorant), Georgia, serif;
          padding: 0;
        }
        .pop-open:hover {
          text-decoration: underline;
        }
        .gc-pin {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #e8a84c;
          box-shadow: 0 0 10px 3px rgba(232, 168, 76, 0.4);
          cursor: pointer;
          position: relative;
          transition: transform 0.2s;
        }
        .gc-pin.mine {
          background: #7ecfa0;
          box-shadow: 0 0 10px 3px rgba(126, 207, 160, 0.4);
        }
        .gc-pin::after {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          border: 1px solid rgba(232, 168, 76, 0.22);
          animation: pulse 3s ease infinite;
        }
        .gc-pin.mine::after {
          border-color: rgba(126, 207, 160, 0.22);
        }
        .gc-pin:hover {
          transform: scale(1.4) !important;
        }
        .selected-pin {
          width: 24px;
          height: 24px;
          position: relative;
        }
        .selected-pin .pin-center {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e8a84c;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 12px 4px rgba(232, 168, 76, 0.6);
        }
        .selected-pin .pin-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 24px;
          height: 24px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid #e8a84c;
          animation: selectedPulse 1.5s ease infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        @keyframes selectedPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
