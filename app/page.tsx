"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { getSupabase } from "@/lib/supabase"
import { AuthScreen } from "@/components/auth-screen"
import { TopBar } from "@/components/top-bar"
import { MapWrapper } from "@/components/map-wrapper"
import { TimelineView } from "@/components/timeline-view"
import { MemoryModal } from "@/components/memory-modal"
import { DeleteModal } from "@/components/delete-modal"
import { MemoryViewer } from "@/components/memory-viewer"
import { LetterPanel } from "@/components/letter-panel"
import { Toast } from "@/components/toast"

export interface Memory {
  id: string
  user_id: string
  author_name: string
  person_name: string
  place: string
  text: string
  lat: number
  lng: number
  reflection?: string
  letter?: string
  created_at: string
}

export interface CurrentUser {
  id: string
  email: string
  name: string
}

export default function GriefCartographer() {
  // Use singleton supabase client to avoid multiple instances
  const supabase = useMemo(() => getSupabase(), [])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [showAuth, setShowAuth] = useState(true)
  const [memories, setMemories] = useState<Memory[]>([])
  const [currentView, setCurrentView] = useState<"map" | "timeline">("map")
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; place?: string } | null>(null)
  const [showMemoryModal, setShowMemoryModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [viewingMemory, setViewingMemory] = useState<Memory | null>(null)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null)
  const [showLetter, setShowLetter] = useState(false)
  const [letterMemory, setLetterMemory] = useState<Memory | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Reverse geocode when selectedLocation changes (and no place name yet)
  useEffect(() => {
    if (selectedLocation && !selectedLocation.place) {
      fetch(`https://photon.komoot.io/reverse?lon=${selectedLocation.lng}&lat=${selectedLocation.lat}&limit=1`)
        .then((r) => r.json())
        .then((data) => {
          const f = data.features?.[0]
          if (f) {
            const p = f.properties
            const name = [p.name, p.city || p.county, p.country].filter(Boolean).join(", ")
            if (name) {
              setSelectedLocation(prev => prev ? { ...prev, place: name } : null)
            }
          }
        })
        .catch(() => {
          // Fallback to coordinates if geocoding fails
        })
    }
  }, [selectedLocation?.lat, selectedLocation?.lng])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2700)
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = session.user
        const name = (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "User"
        setCurrentUser({ id: user.id, email: user.email || "", name })
        setShowAuth(false)
      }
    })
  }, [supabase])

  // Load memories when authenticated
  useEffect(() => {
    if (showAuth) return

    const loadMemories = async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading memories:", error)
        return
      }
      setMemories(data || [])
    }

    loadMemories()

    // Set up realtime subscription
    const channel = supabase
      .channel("memories")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "memories" }, (payload) => {
        const mem = payload.new as Memory
        setMemories((prev) => {
          if (prev.find((m) => m.id === mem.id)) return prev
          showToast("New memory placed")
          return [mem, ...prev]
        })
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "memories" }, (payload) => {
        const mem = payload.new as Memory
        setMemories((prev) => prev.map((m) => (m.id === mem.id ? mem : m)))
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "memories" }, (payload) => {
        const id = payload.old.id
        setMemories((prev) => prev.filter((m) => m.id !== id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, showAuth, showToast])

  const handleSignIn = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    if (!data.user) return "Sign in failed"

    const user = data.user
    const name = (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "User"
    setCurrentUser({ id: user.id, email: user.email || "", name })
    setShowAuth(false)
    return null
  }

  const handleSignUp = async (email: string, password: string, name: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name || email.split("@")[0] } },
    })
    if (error) return error.message
    if (!data.user) return "Account created! Check your email to confirm, then sign in."

    const user = data.user
    const displayName = (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "User"
    setCurrentUser({ id: user.id, email: user.email || "", name: displayName })
    setShowAuth(false)
    return null
  }

  const handleGuestBrowse = () => {
    setIsGuest(true)
    setCurrentUser(null)
    setShowAuth(false)
  }

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setCurrentUser(null)
    setIsGuest(false)
    setShowAuth(true)
    setMemories([])
    setSelectedLocation(null)
  }

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (!currentUser) {
      showToast("Sign in to place a memory")
      setShowAuth(true)
      return
    }
    // Check for valid coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return
    }
    setSelectedLocation({ lat, lng })
  }, [currentUser, showToast])

  const handleLocationSelect = (lat: number, lng: number, place: string) => {
    setSelectedLocation({ lat, lng, place })
  }

  const openMemoryModal = () => {
    if (!currentUser) {
      setShowAuth(true)
      return
    }
    setEditingMemory(null)
    setShowMemoryModal(true)
  }

  const handleSaveMemory = async (personName: string, place: string, text: string): Promise<string | null> => {
    if (!supabase || !currentUser) return "Not authenticated"

    if (editingMemory) {
      const { error } = await supabase
        .from("memories")
        .update({ person_name: personName, place: place || "A place", text })
        .eq("id", editingMemory.id)
        .eq("user_id", currentUser.id)

      if (error) return error.message

      setMemories((prev) =>
        prev.map((m) => (m.id === editingMemory.id ? { ...m, person_name: personName, place: place || "A place", text } : m))
      )
      showToast("Memory updated")
    } else {
      if (!selectedLocation) return "No location selected"

      const { data, error } = await supabase
        .from("memories")
        .insert({
          user_id: currentUser.id,
          author_name: currentUser.name,
          person_name: personName,
          place: place || "A place",
          text,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        })
        .select()
        .single()

      if (error) return error.message

      setMemories((prev) => [data as Memory, ...prev])
      setSelectedLocation(null)
      showToast("Memory placed on the shared map")
    }

    setShowMemoryModal(false)
    setEditingMemory(null)
    return null
  }

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory)
    setViewingMemory(null)
    setShowMemoryModal(true)
  }

  const handleDeletePrompt = (memory: Memory) => {
    setDeletingMemoryId(memory.id)
    setViewingMemory(null)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!supabase || !deletingMemoryId || !currentUser) return

    const { error } = await supabase.from("memories").delete().eq("id", deletingMemoryId).eq("user_id", currentUser.id)

    if (error) {
      showToast("Could not remove memory")
    } else {
      setMemories((prev) => prev.filter((m) => m.id !== deletingMemoryId))
      showToast("Memory removed")
    }

    setShowDeleteModal(false)
    setDeletingMemoryId(null)
  }

  const handleOpenLetter = (memory: Memory) => {
    setLetterMemory(memory)
    setShowLetter(true)
    setViewingMemory(null)
  }

  const handleViewMemory = (memory: Memory) => {
    setViewingMemory(memory)
    setCurrentView("map")
  }

  return (
    <div className="h-screen overflow-hidden bg-ink">
      {showAuth && (
        <AuthScreen
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onGuestBrowse={handleGuestBrowse}
        />
      )}

      {!showAuth && (
        <>
          <TopBar
            currentUser={currentUser}
            isGuest={isGuest}
            currentView={currentView}
            onViewChange={setCurrentView}
            onSignOut={handleSignOut}
            onSignIn={() => setShowAuth(true)}
          />

          {currentView === "map" ? (
            <>
              <MapWrapper
                memories={memories}
                currentUser={currentUser}
                selectedLocation={selectedLocation}
                onMapClick={handleMapClick}
                onLocationSelect={handleLocationSelect}
                onAddMemory={openMemoryModal}
                onViewMemory={setViewingMemory}
                onClearSelection={() => setSelectedLocation(null)}
              />
              {/* Selected location panel - rendered outside map to avoid re-mount issues */}
              {selectedLocation && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-[rgba(13,15,38,0.97)] border border-border rounded px-5 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center gap-4 max-w-[90vw]">
                  <div className="text-center sm:text-left">
                    <div className="text-[0.67rem] tracking-[0.18em] uppercase text-amber mb-1">Selected Location</div>
                    <div className="text-star font-serif text-[0.95rem]">
                      {selectedLocation.place || `${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={openMemoryModal}
                      className="bg-amber text-ink border-none cursor-pointer font-serif text-[0.73rem] tracking-[0.14em] uppercase py-2 px-3.5 rounded transition-all hover:bg-star whitespace-nowrap"
                    >
                      + Add memory here
                    </button>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="bg-transparent border border-border text-muted-color py-2 px-3 rounded cursor-pointer font-serif text-[0.73rem] tracking-[0.14em] uppercase transition-all hover:border-dim hover:text-amber whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {/* Map hint */}
              {!selectedLocation && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] text-[0.67rem] tracking-[0.18em] uppercase text-muted-color pointer-events-none whitespace-nowrap font-serif">
                  Click anywhere on the map to place a memory
                </div>
              )}
            </>
          ) : (
            <TimelineView
              memories={memories}
              currentUser={currentUser}
              onViewMemory={handleViewMemory}
            />
          )}

          {showMemoryModal && (
            <MemoryModal
              isOpen={showMemoryModal}
              onClose={() => {
                setShowMemoryModal(false)
                setEditingMemory(null)
              }}
              onSave={handleSaveMemory}
              editingMemory={editingMemory}
              selectedPlace={selectedLocation?.place}
            />
          )}

          {showDeleteModal && (
            <DeleteModal
              isOpen={showDeleteModal}
              onClose={() => {
                setShowDeleteModal(false)
                setDeletingMemoryId(null)
              }}
              onConfirm={handleConfirmDelete}
            />
          )}

          {viewingMemory && (
            <MemoryViewer
              memory={viewingMemory}
              currentUser={currentUser}
              onClose={() => setViewingMemory(null)}
              onEdit={handleEditMemory}
              onDelete={handleDeletePrompt}
              onOpenLetter={handleOpenLetter}
            />
          )}

          {showLetter && letterMemory && (
            <LetterPanel
              memory={letterMemory}
              onClose={() => {
                setShowLetter(false)
                setLetterMemory(null)
              }}
            />
          )}
        </>
      )}

      <Toast message={toast} />
    </div>
  )
}
