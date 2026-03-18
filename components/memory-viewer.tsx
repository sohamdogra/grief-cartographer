"use client"

import { Memory, CurrentUser } from "@/app/page"

interface MemoryViewerProps {
  memory: Memory
  currentUser: CurrentUser | null
  onClose: () => void
  onEdit: (memory: Memory) => void
  onDelete: (memory: Memory) => void
  onOpenLetter: (memory: Memory) => void
}

export function MemoryViewer({ memory, currentUser, onClose, onEdit, onDelete, onOpenLetter }: MemoryViewerProps) {
  const isOwn = currentUser?.id === memory.user_id

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return ""
    }
  }

  return (
    <div
      className="fixed inset-0 z-[700] flex items-center justify-center bg-[rgba(5,6,18,0.93)] backdrop-blur-[15px] transition-opacity"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-w-[640px] w-[90%] relative">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 bg-none border-none text-muted-color cursor-pointer font-serif text-[0.75rem] tracking-[0.18em] uppercase transition-colors hover:text-amber"
        >
          Close
        </button>

        <div className="text-[0.67rem] tracking-[0.28em] uppercase text-amber mb-1.5">
          In memory of {memory.person_name}
        </div>

        <div className="text-[0.72rem] text-muted-color italic mb-2">by {memory.author_name || "someone"}</div>

        <div className="text-[0.72rem] tracking-[0.18em] uppercase text-muted-color mb-3">{memory.place}</div>

        <div className="font-serif text-[1.5rem] font-light text-star leading-[1.52] mb-5">{memory.text}</div>

        {memory.reflection && (
          <div className="italic text-base text-text leading-[1.8] border-l border-[rgba(232,168,76,0.3)] pl-4 mb-4">
            {memory.reflection}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[0.7rem] text-muted-color">{formatDate(memory.created_at)}</span>

          <button
            onClick={onClose}
            className="text-[0.7rem] tracking-[0.13em] uppercase bg-none border-none cursor-pointer font-sans transition-colors p-0 text-amber hover:underline"
          >
            Back to map
          </button>

          <button
            onClick={() => onOpenLetter(memory)}
            className="text-[0.7rem] tracking-[0.13em] uppercase bg-none border-none cursor-pointer font-sans transition-colors p-0 text-muted-color hover:text-amber"
          >
            Read a letter from them
          </button>
        </div>

        {isOwn && (
          <div className="flex gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <button
              onClick={() => onEdit(memory)}
              className="text-[0.7rem] tracking-[0.13em] uppercase bg-none border-none cursor-pointer font-sans transition-colors p-0 text-[rgba(126,207,160,0.7)] hover:text-green"
            >
              Edit this memory
            </button>

            <button
              onClick={() => onDelete(memory)}
              className="text-[0.7rem] tracking-[0.13em] uppercase bg-none border-none cursor-pointer font-sans transition-colors p-0 text-danger opacity-70 hover:opacity-100"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
