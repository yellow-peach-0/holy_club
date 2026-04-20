'use client'

import { VERSES } from '@/lib/constants'

export function VerseCard() {
  const dayOfMonth = new Date().getDate()
  const verse = VERSES[dayOfMonth % VERSES.length]

  return (
    <div className="bg-gradient-to-br from-accent via-primary to-[#A855F7] rounded-[20px] p-[22px] text-white relative overflow-hidden mb-3.5">
      <span className="absolute -top-2 left-2.5 text-[90px] opacity-[0.12] font-serif leading-none">{'"'}</span>
      <p className="m-0 mb-2 text-sm leading-relaxed relative z-10 break-keep">
        {`"${verse.t}"`}
      </p>
      <p className="m-0 text-[11px] opacity-75 relative z-10">
        — {verse.r}
      </p>
    </div>
  )
}
