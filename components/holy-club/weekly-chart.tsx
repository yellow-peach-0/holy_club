'use client'

import { useEffect, useRef } from 'react'
import { useStore } from '@/lib/store'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

export function WeeklyChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wordTime = useStore((s) => s.wordTime)
  const prayTime = useStore((s) => s.prayTime)
  const media = useStore((s) => s.media)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const parent = canvas.parentElement
    const W = (parent?.clientWidth || 300) - 32
    const H = 90

    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)

    // Prepare data for last 7 days
    const data = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
      const key = date.toISOString().slice(0, 10)
      const godly = Math.round(((wordTime[key] || 0) + (prayTime[key] || 0)) / 60)
      const mediaMin = Object.values(media[key] || {}).reduce((a: number, v) => a + (v as number), 0)
      data.push({ day: DAYS[date.getDay()], g: godly, m: mediaMin })
    }

    const maxV = Math.max(10, ...data.map((d) => Math.max(d.g, d.m)))
    const barW = 14
    const spacing = (W - 40) / 7
    const chartH = H - 18

    data.forEach((d, i) => {
      const x = 20 + i * spacing + spacing / 2

      // Media bar
      if (d.m > 0) {
        const mH = Math.max(2, (d.m / maxV) * chartH)
        ctx.fillStyle = '#FCA5A5'
        roundBar(ctx, x - barW / 2 - 1, chartH - mH, barW - 2, mH, 3)
      }

      // Godly bar
      if (d.g > 0) {
        const gH = Math.max(2, (d.g / maxV) * chartH)
        ctx.fillStyle = '#7C3AED'
        ctx.globalAlpha = 0.9
        roundBar(ctx, x - barW / 2 + 1, chartH - gH, barW - 2, gH, 3)
        ctx.globalAlpha = 1
      }

      // Day label
      ctx.fillStyle = '#C4B5FD'
      ctx.font = '10px -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(d.day, x, H - 2)
    })
  }, [wordTime, prayTime, media])

  return (
    <div className="bg-card rounded-[20px] p-4 shadow-[0_2px_12px_rgba(109,40,217,0.07)] mb-3">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[13px] font-semibold text-card-foreground">이번 주 현황</span>
        <div className="flex gap-2.5 text-[10px] text-gray-400 items-center">
          <span>
            <span className="inline-block w-2 h-2 bg-primary rounded-sm mr-0.5" />
            경건
          </span>
          <span>
            <span className="inline-block w-2 h-2 bg-[#FCA5A5] rounded-sm mr-0.5" />
            미디어
          </span>
        </div>
      </div>
      <canvas ref={canvasRef} height={90} className="w-full" style={{ height: '90px' }} />
    </div>
  )
}

function roundBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (h <= 0) return
  r = Math.min(r, h / 2, w / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  ctx.fill()
}
