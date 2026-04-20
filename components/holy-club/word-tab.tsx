'use client'

import { useState } from 'react'
import { useStore, getTodayKey } from '@/lib/store'
import { BIBLE, TOTAL_CHAPTERS, CHEERS } from '@/lib/constants'
import { Stopwatch } from './stopwatch'
import { useToast } from './toast-provider'

type Testament = 'old' | 'new'

export function WordTab() {
  const [testament, setTestament] = useState<Testament>('old')
  const [selectedBook, setSelectedBook] = useState<number | null>(null)
  const { showToast } = useToast()

  const today = getTodayKey()
  const wordTime = useStore((s) => s.wordTime)
  const bibleRead = useStore((s) => s.bibleRead)
  const goals = useStore((s) => s.goals)
  const toggleBibleChapter = useStore((s) => s.toggleBibleChapter)
  const updateStreak = useStore((s) => s.updateStreak)

  const todaySeconds = wordTime[today] || 0
  const readCount = Object.values(bibleRead).filter(Boolean).length
  const biblePct = Math.round((readCount / TOTAL_CHAPTERS) * 100)

  const books = BIBLE.filter((b) => b.t === testament)

  const handleToggleChapter = (bookIdx: number, chapter: number) => {
    const key = `${bookIdx}-${chapter}`
    const wasRead = !!bibleRead[key]
    toggleBibleChapter(bookIdx, chapter)
    if (!wasRead) {
      showToast(CHEERS[Math.floor(Math.random() * CHEERS.length)])
      updateStreak(today, true)
    }
  }

  const getBookProgress = (bookIdx: number) => {
    const book = BIBLE[bookIdx]
    let count = 0
    for (let i = 1; i <= book.c; i++) {
      if (bibleRead[`${bookIdx}-${i}`]) count++
    }
    return count
  }

  return (
    <div className="px-4 pb-6">
      {/* Header */}
      <div className="py-4">
        <h2 className="m-0 text-xl font-bold text-accent">말씀 묵상</h2>
        <p className="m-0 mt-1 text-[12px] text-muted-foreground">
          {readCount.toLocaleString()}/{TOTAL_CHAPTERS.toLocaleString()} 장 완료 · {biblePct}%
        </p>
      </div>

      <Stopwatch type="medi" todaySeconds={todaySeconds} goal={goals.word} onSave={() => {}} />

      {/* Progress */}
      <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] mb-3">
        <div className="flex justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-card-foreground">전체 성경 진도</span>
          <span className="text-sm font-bold text-primary">{biblePct}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-[#A855F7] rounded-full transition-all duration-500"
            style={{ width: `${biblePct}%` }}
          />
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">
          {readCount.toLocaleString()} / {TOTAL_CHAPTERS.toLocaleString()} 장
        </div>
      </div>

      {/* Testament Tabs */}
      <div className="flex gap-2 mb-3.5">
        <button
          onClick={() => {
            setTestament('old')
            setSelectedBook(null)
          }}
          className={`flex-1 py-2 px-4 rounded-[10px] border-[1.5px] text-[13px] font-semibold cursor-pointer transition-all ${
            testament === 'old'
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-muted-foreground border-secondary'
          }`}
        >
          구약 (39권)
        </button>
        <button
          onClick={() => {
            setTestament('new')
            setSelectedBook(null)
          }}
          className={`flex-1 py-2 px-4 rounded-[10px] border-[1.5px] text-[13px] font-semibold cursor-pointer transition-all ${
            testament === 'new'
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-muted-foreground border-secondary'
          }`}
        >
          신약 (27권)
        </button>
      </div>

      {/* Book Grid or Chapter View */}
      {selectedBook === null ? (
        <div className="grid grid-cols-3 gap-2">
          {books.map((book) => {
            const idx = BIBLE.indexOf(book)
            const progress = getBookProgress(idx)
            const pct = Math.round((progress / book.c) * 100)
            const isDone = progress === book.c

            return (
              <button
                key={idx}
                onClick={() => setSelectedBook(idx)}
                className={`py-2.5 px-1 rounded-xl border-[1.5px] text-[11.5px] font-medium cursor-pointer text-center transition-all leading-tight ${
                  isDone
                    ? 'border-primary bg-secondary text-primary'
                    : 'border-secondary bg-white text-card-foreground hover:border-primary hover:bg-muted'
                }`}
              >
                {book.n}
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {progress > 0 ? `${pct}%` : `${book.c}장`}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setSelectedBook(null)}
              className="bg-secondary border-none rounded-lg px-3 py-1.5 text-primary text-[13px] cursor-pointer"
            >
              ← 목록
            </button>
            <span className="text-[17px] font-bold text-accent">{BIBLE[selectedBook].n}</span>
            <span className="text-[12px] text-muted-foreground ml-auto">
              {getBookProgress(selectedBook)}/{BIBLE[selectedBook].c}장
            </span>
          </div>
          <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)]">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: BIBLE[selectedBook].c }, (_, i) => {
                const ch = i + 1
                const isRead = !!bibleRead[`${selectedBook}-${ch}`]
                return (
                  <button
                    key={ch}
                    onClick={() => handleToggleChapter(selectedBook, ch)}
                    className={`aspect-square rounded-full border-[1.5px] text-[12px] font-medium cursor-pointer flex items-center justify-center transition-all active:scale-90 ${
                      isRead
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-primary border-input'
                    }`}
                  >
                    {ch}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
