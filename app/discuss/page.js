'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { loadState, startVote } from '../../lib/game'

const DISCUSS_SECONDS = 180 // 3 minutes default

export default function Discuss() {
  const router = useRouter()
  const [state, setState] = useState(null)
  const [seconds, setSeconds] = useState(DISCUSS_SECONDS)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    const s = loadState()
    if (!s) { router.replace('/'); return }
    if (s.phase !== 'discuss') {
      if (s.phase === 'vote') router.replace('/vote')
      else if (s.phase === 'results') router.replace('/results')
      else if (s.phase === 'reveal') router.replace('/reveal')
      return
    }
    setState(s)
  }, [router])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const goToVote = () => {
    if (!state) return
    clearInterval(intervalRef.current)
    const next = startVote(state)
    setState(next)
    router.push('/vote')
  }

  if (!state) return <LoadingScreen />

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const pct = (seconds / DISCUSS_SECONDS) * 100
  const urgent = seconds <= 30

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-black text-white mb-1">وادە باس</h1>
        <p className="text-white/40 text-sm">ئیمپۆستەرەکە بدۆزەوە!</p>
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-sm">
        {/* Circular timer */}
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
          <svg className="absolute" width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke={urgent ? '#ef4444' : '#c044f0'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
            />
          </svg>
          <div className="text-center z-10">
            <p className={`text-5xl font-black tabular-nums ${urgent ? 'text-red-400' : 'text-white'}`}>
              {mins}:{secs.toString().padStart(2, '0')}
            </p>
            <p className="text-white/30 text-xs mt-1">
              {running ? (urgent ? '⚡ خێرا بن!' : '⏱️ کات دەڕوات') : '⏰ کات تەواو بوو'}
            </p>
          </div>
        </div>

        {/* Pause / Resume */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setRunning((r) => !r)}
            className="btn-secondary flex-1 py-3"
          >
            {running ? '⏸️ وەستان' : '▶️ بەردەوامبوون'}
          </button>
          <button
            onClick={() => { setSeconds(DISCUSS_SECONDS); setRunning(true) }}
            className="btn-secondary py-3 px-4"
          >
            🔄
          </button>
        </div>

        {/* Tips */}
        <div className="game-card p-5 w-full">
          <p className="text-white/60 text-sm font-bold mb-3">🧠 ئامۆژگاری باس</p>
          <ul className="flex flex-col gap-2 text-white/50 text-sm">
            <li>• وشەکە ڕاستەوخۆ مەگۆیە</li>
            <li>• پرسیاری نیشانەدار بکە</li>
            <li>• بگەڕێ بۆ وەڵامی کەسانی دیکە</li>
            <li>• ئیمپۆستەر دووچار ئەبێت شوێن بکاتەوە</li>
          </ul>
        </div>

        {/* Players */}
        <div className="w-full">
          <p className="text-white/40 text-xs mb-2 text-center">یارمەتیدەران</p>
          <div className="flex flex-wrap justify-center gap-2">
            {state.players.map((p, i) => (
              <span key={i} className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-white/70">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Vote button */}
      <div className="w-full max-w-sm">
        <button onClick={goToVote} className="btn-primary w-full py-5 text-xl rounded-2xl">
          🗳️ دەنگدان دەست پێ بکە
        </button>
        <p className="text-white/20 text-xs text-center mt-3">
          دەتوانیت پێش تەواوبوونی کات دەنگ بدەیت
        </p>
      </div>
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-2xl animate-pulse-slow">⏳</div>
    </main>
  )
}
