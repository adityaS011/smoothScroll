"use client";

import { useLocalStorageDismiss } from "@/hooks/useLocalStorageDismiss";

function ChatBubble() {
  return (
    <button
      aria-label="Support chat"
      className="grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-500"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5Z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function BookATourPill() {
  const { dismissed, hydrated, dismiss } = useLocalStorageDismiss("book-a-tour-dismissed");

  return (
    <div className="flex items-center gap-3">
      {/* Only render after the localStorage check so a dismissed pill
          never flashes on-screen for a frame after refresh. */}
      {hydrated && !dismissed && (
        <div className="flex items-center gap-2 rounded-full bg-black/60 py-1.5 pr-2 pl-1.5 text-white backdrop-blur">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-xs font-bold">
            UH
          </span>
          <span className="text-xs font-semibold tracking-wide">BOOK A TOUR</span>
          <button
            aria-label="Dismiss book a tour"
            onClick={dismiss}
            className="grid h-6 w-6 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
      <ChatBubble />
    </div>
  );
}
