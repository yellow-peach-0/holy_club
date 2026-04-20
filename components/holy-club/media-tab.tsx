'use client'

import { useEffect, useRef } from 'react'
import { useStore, getTodayKey } from '@/lib/store'
import { PLATFORMS } from '@/lib/constants'

interface MediaTabProps {
  onOpenGoalModal: () => void
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function MediaTab({ onOpenGoalModal }: MediaTabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const today = getTodayKey()

  const wordTime = useStore((s) => s.wordTime)
  const prayTime = useStore((s) => s.prayTime)
  const media = useStore((s) => s.media)
  const goals = useStore((s) => s.goals)
  const setMediaTime = useStore((s) => s.setMediaTime)

  const mediaData = media[today] || {}
  const totalMedia = Object.values(mediaData).reduce((a: number, v) => a + (v as number), 0)

  const wordMin = Math.round((wordTime[today] || 0) / 60)
  const prayMin = Math.round((prayTime[today] || 0) / 60)
  const godlyMin = wordMin + prayMin

  const maxCompare = Math.max(totalMedia, godlyMin, 1)
  const godlyPct = Math.round((godlyMin / maxCompare) * 100)
  const mediaPct = Math.round((totalMedia / maxCompare) * 100)
  const mediaColor =
    totalMedia > godlyMin * 2
      ? 'linear-gradient(90deg,#EF4444,#F87171)'
      : totalMedia > godlyMin
        ? 'linear-gradient(90deg,#F59E0B,#FCD34D)'
        : '#D1D5DB'

  const limitPct = Math.min(100, Math.round((totalMedia / goals.media) * 100))
  const limitColor = limitPct >= 100 ? '#EF4444' : limitPct >= 80 ? '#F59E0B' : '#7C3AED'

  const handleAdjust = (platform: string, delta: number) => {
    const current = mediaData[platform] || 0
    setMediaTime(today, platform, Math.max(0, current + delta))
  }

  const handleSet = (platform: string, value: string) => {
    setMediaTime(today, platform, Math.max(0, parseInt(value) || 0))
  }

  // Draw trend chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const parent = canvas.parentElement
    const W = (parent?.clientWidth || 300) - 32
    const H = 110

    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    const data: { day: string; g: number; m: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
      const key = date.toISOString().slice(0, 10)
      const g = Math.round(((wordTime[key] || 0) + (prayTime[key] || 0)) / 60)
      const m = Object.values(media[key] || {}).reduce((a: number, v) => a + (v as number), 0)
      data.push({ day: DAYS[date.getDay()], g, m })
    }

    const maxV = Math.max(10, ...data.map((d) => Math.max(d.g, d.m)))
    const pad = 16
    const chartW = W - pad * 2
    const chartH = H - 20

    // Grid line
    ctx.strokeStyle = '#F3F4F6'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(pad, chartH / 2)
    ctx.lineTo(W - pad, chartH / 2)
    ctx.stroke()

    // Lines
    const lines = [
      { key: 'g', color: '#7C3AED' },
      { key: 'm', color: '#EF4444' },
    ]
    lines.forEach(({ key, color }) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.beginPath()
      data.forEach((d, i) => {
        const x = pad + (i / 6) * chartW
        const y = chartH - ((d as any)[key] / maxV) * chartH
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()

      // Dots
      data.forEach((d, i) => {
        const val = (d as any)[key]
        if (val <= 0) return
        const x = pad + (i / 6) * chartW
        const y = chartH - (val / maxV) * chartH
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      })
    })

    // Day labels
    ctx.fillStyle = '#C4B5FD'
    ctx.font = '10px -apple-system, sans-serif'
    ctx.textAlign = 'center'
    data.forEach((d, i) => ctx.fillText(d.day, pad + (i / 6) * chartW, H - 2))
  }, [wordTime, prayTime, media])

  return (
    <div className="px-4 pb-6">
      {/* Header */}
      <div className="py-4 flex items-center justify-between">
        <div>
          <h2 className="m-0 text-xl font-bold text-accent">미디어 시간</h2>
          <p className="m-0 mt-1 text-[12px] text-muted-foreground">오늘 사용한 시간을 기록해요</p>
        </div>
        <button
          onClick={onOpenGoalModal}
          className="bg-muted border-[1.5px] border-input rounded-[10px] px-3 py-1.5 text-[12px] text-primary cursor-pointer font-semibold"
        >
          목표 설정
        </button>
      </div>

      {/* Media Input */}
      <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] mb-3">
        {PLATFORMS.map((p) => (
          <div
            key={p.k}
            className="flex items-center gap-2.5 py-2.5 border-b border-gray-100 last:border-none"
          >
            <span className="text-xl">{p.e}</span>
            <span className="text-sm font-medium text-card-foreground flex-1">{p.l}</span>
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => handleAdjust(p.k, -5)}
                className="w-7 h-7 rounded-lg border border-input bg-muted text-primary text-base cursor-pointer flex items-center justify-center"
              >
                −
              </button>
              <input
                type="number"
                value={mediaData[p.k] || 0}
                onChange={(e) => handleSet(p.k, e.target.value)}
                min={0}
                className="w-11 text-center border border-input rounded-lg py-1 px-0.5 text-sm text-card-foreground outline-none focus:border-primary"
              />
              <button
                onClick={() => handleAdjust(p.k, 5)}
                className="w-7 h-7 rounded-lg border border-input bg-muted text-primary text-base cursor-pointer flex items-center justify-center"
              >
                +
              </button>
              <span className="text-[11px] text-muted-foreground w-4">분</span>
            </div>
          </div>
        ))}
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <span className="text-sm font-bold text-card-foreground">오늘 총계</span>
          <span className="text-xl font-bold text-card-foreground">{totalMedia}분</span>
        </div>
      </div>

      {/* Comparison */}
      <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] mb-3">
        <div className="text-[13px] font-semibold text-card-foreground mb-3.5">오늘의 대비</div>
        <div className="mb-3.5">
          <div className="flex justify-between mb-1">
            <span className="text-[12px] text-gray-500">📖 말씀 + 기도</span>
            <span className="text-[13px] font-bold text-primary">{godlyMin}분</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${godlyPct}%`, background: 'linear-gradient(90deg,#7C3AED,#A855F7)' }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[12px] text-gray-500">📱 미디어</span>
            <span
              className="text-[13px] font-bold"
              style={{ color: totalMedia > godlyMin ? '#EF4444' : '#9CA3AF' }}
            >
              {totalMedia}분
            </span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${mediaPct}%`, background: mediaColor }}
            />
          </div>
        </div>
        {(totalMedia > 0 || godlyMin > 0) && (
          <div
            className="mt-3 text-center text-[13px] font-semibold"
            style={{ color: godlyMin >= totalMedia ? '#7C3AED' : '#F59E0B' }}
          >
            {godlyMin >= totalMedia
              ? '경건 시간이 미디어보다 많아요!'
              : `미디어가 ${totalMedia - godlyMin}분 더 많아요`}
          </div>
        )}
      </div>

      {/* 7-day Trend */}
      <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] mb-3">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[13px] font-semibold text-card-foreground">7일 트렌드</span>
          <div className="flex gap-2.5 text-[10px] text-gray-400">
            <span>
              <span className="inline-block w-4 h-0.5 bg-primary rounded-full align-middle mr-0.5" />
              경건
            </span>
            <span>
              <span className="inline-block w-4 h-0.5 bg-destructive rounded-full align-middle mr-0.5" />
              미디어
            </span>
          </div>
        </div>
        <canvas ref={canvasRef} height={110} className="w-full" style={{ height: '110px' }} />
      </div>

      {/* Goal Card */}
      <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)]">
        <div className="text-[13px] font-semibold text-card-foreground mb-2.5">📉 미디어 한도</div>
        <div className="flex justify-between mb-1.5">
          <span className="text-[12px] text-gray-400">
            {totalMedia}분 사용 / 한도 {goals.media}분
          </span>
          <span className="text-[12px] font-bold" style={{ color: limitColor }}>
            {limitPct}%
          </span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${limitPct}%`, background: limitColor }}
          />
        </div>
        <div className="mt-2 text-center text-[13px] font-semibold" style={{ color: limitColor }}>
          {limitPct >= 100
            ? '오늘 미디어 한도를 초과했어요'
            : limitPct >= 80
              ? `한도까지 ${goals.media - totalMedia}분 남았어요`
              : `남은 여유 ${goals.media - totalMedia}분`}
        </div>
      </div>
    </div>
  )
}
