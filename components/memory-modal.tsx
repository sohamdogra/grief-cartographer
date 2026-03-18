"use client"

import { useState, useEffect } from "react"
import { Memory } from "@/app/page"

interface MemoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (personName: string, place: string, text: string) => Promise<string | null>
  editingMemory: Memory | null
  selectedPlace?: string
}

export function MemoryModal({ isOpen, onClose, onSave, editingMemory, selectedPlace }: MemoryModalProps) {
  const [personName, setPersonName] = useState("")
  const [place, setPlace] = useState("")
  const [text, setText] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingMemory) {
      setPersonName(editingMemory.person_name || "")
      setPlace(editingMemory.place || "")
      setText(editingMemory.text || "")
    } else {
      setPersonName("")
      setPlace(selectedPlace || "")
      setText("")
    }
    setError("")
  }, [editingMemory, selectedPlace, isOpen])

  const handleSave = async () => {
    setError("")

    if (!personName.trim()) {
      setError("Please enter the name of the person you are remembering.")
      return
    }
    if (!text.trim()) {
      setError("Please write something about this memory.")
      return
    }

    setSaving(true)
    const result = await onSave(personName.trim(), place.trim(), text.trim())
    setSaving(false)

    if (result) {
      setError(result)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(5,6,18,0.9)] backdrop-blur-[12px] transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-deep border border-border rounded px-10 py-9 max-w-[520px] w-[90%] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 bg-none border-none text-muted-color cursor-pointer text-[1.1rem] transition-colors hover:text-amber"
        >
          ✕
        </button>

        <div className="font-serif text-[0.88rem] tracking-[0.2em] uppercase text-amber mb-1.5">
          {editingMemory ? "Edit this memory" : "Place a Memory"}
        </div>
        <div className="italic text-[0.87rem] text-muted-color mb-5 leading-[1.55]">
          This memory will appear on the shared map for everyone to see.
        </div>

        <div className="mb-4">
          <label className="text-[0.67rem] tracking-[0.22em] uppercase text-muted-color block mb-2">
            In memory of
          </label>
          <input
            type="text"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="their name..."
            className="w-full bg-[rgba(255,255,255,0.04)] border border-border rounded text-star font-sans text-base font-light py-2.5 px-3 outline-none transition-all placeholder:text-faint placeholder:italic focus:border-dim focus:bg-soft"
          />
        </div>

        <div className="mb-4">
          <label className="text-[0.67rem] tracking-[0.22em] uppercase text-muted-color block mb-2">
            The place
          </label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            placeholder="e.g. the kitchen on Sunday mornings..."
            className="w-full bg-[rgba(255,255,255,0.04)] border border-border rounded text-star font-sans text-base font-light py-2.5 px-3 outline-none transition-all placeholder:text-faint placeholder:italic focus:border-dim focus:bg-soft"
          />
        </div>

        <div className="mb-4">
          <label className="text-[0.67rem] tracking-[0.22em] uppercase text-muted-color block mb-2">
            The memory
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write whatever comes. This belongs to everyone now."
            rows={4}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-border rounded text-star font-sans text-base font-light py-2.5 px-3 outline-none transition-all resize-none leading-[1.65] placeholder:text-faint placeholder:italic focus:border-dim focus:bg-soft"
          />
        </div>

        <div className="flex gap-2.5 mt-5 flex-wrap">
          <button
            onClick={handleSave}
            disabled={saving}
            className="py-2.5 px-5 border-none rounded cursor-pointer font-serif text-[0.82rem] tracking-[0.18em] uppercase transition-all bg-amber text-ink hover:bg-star hover:shadow-[0_0_22px_var(--glow)] disabled:opacity-50 disabled:cursor-default disabled:shadow-none"
          >
            {saving ? "Saving..." : "Hold this memory"}
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded cursor-pointer font-serif text-[0.82rem] tracking-[0.18em] uppercase transition-all bg-transparent border border-[rgba(255,255,255,0.11)] text-muted-color hover:border-dim hover:text-amber"
          >
            Not yet
          </button>
        </div>

        {error && <div className="text-[0.78rem] text-danger mt-2 min-h-[16px]">{error}</div>}
      </div>
    </div>
  )
}
