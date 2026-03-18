"use client"

import { CurrentUser } from "@/app/page"

interface TopBarProps {
  currentUser: CurrentUser | null
  isGuest: boolean
  currentView: "map" | "timeline"
  onViewChange: (view: "map" | "timeline") => void
  onSignOut: () => void
  onSignIn: () => void
}

export function TopBar({ currentUser, isGuest, currentView, onViewChange, onSignOut, onSignIn }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-[54px] z-[500] bg-[rgba(8,9,26,0.96)] backdrop-blur-[16px] border-b border-[rgba(232,168,76,0.08)] flex items-center px-4 gap-2.5">
      <div className="flex-shrink-0">
        <div className="font-serif text-[0.95rem] tracking-[0.14em] text-star">Grief Cartographer</div>
        <div className="text-[0.65rem] text-muted-color">A shared memory atlas</div>
      </div>

      <div className="flex-1" />

      <button
        onClick={() => onViewChange("map")}
        className={`bg-transparent border-none cursor-pointer font-serif text-[0.76rem] tracking-[0.16em] uppercase py-1.5 px-2.5 rounded-sm transition-all whitespace-nowrap ${
          currentView === "map" ? "text-amber bg-soft" : "text-muted-color hover:text-text"
        }`}
      >
        Map
      </button>

      <button
        onClick={() => onViewChange("timeline")}
        className={`bg-transparent border-none cursor-pointer font-serif text-[0.76rem] tracking-[0.16em] uppercase py-1.5 px-2.5 rounded-sm transition-all whitespace-nowrap ${
          currentView === "timeline" ? "text-amber bg-soft" : "text-muted-color hover:text-text"
        }`}
      >
        All Memories
      </button>

      {currentUser ? (
        <>
          <div className="text-[0.7rem] text-muted-color whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]">
            Signed in as <span className="text-amber">{currentUser.name}</span>
          </div>
          <button
            onClick={onSignOut}
            className="bg-transparent border border-border text-muted-color py-1.5 px-2.5 rounded-sm cursor-pointer font-serif text-[0.7rem] tracking-[0.14em] uppercase transition-all whitespace-nowrap hover:border-dim hover:text-amber"
          >
            Sign out
          </button>
        </>
      ) : isGuest ? (
        <>
          <div className="text-[0.7rem] text-muted-color whitespace-nowrap">Browsing as guest</div>
          <button
            onClick={onSignIn}
            className="bg-amber text-ink border border-amber py-1.5 px-2.5 rounded-sm cursor-pointer font-serif text-[0.7rem] tracking-[0.14em] uppercase transition-all whitespace-nowrap hover:bg-star hover:border-star"
          >
            Sign in to add memories
          </button>
        </>
      ) : null}
    </div>
  )
}
