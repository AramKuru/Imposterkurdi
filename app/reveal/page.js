'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { loadState, advanceReveal } from '../../lib/game'

// How long (ms) the word must be visible before the "Done" button appears.
// This prevents the tap-to-reveal event from bleeding into the next action.
const HOLD_BEFORE_DONE_MS = 1200

export default function Reveal() {
  const router = useRouter()
  const [state, setState] = useState(null)
  const [phase, setPhase] = useState('waiting') // waiting | showing | done
  const [canAdvance, setCanAdvance] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const s = loadState()
    if (!s) { router.replace('/'); return }
    if (s.phase !== 'reveal') {
      if (s.phase === 'discuss') router.replace('/discuss')
      else if (s.phase === 'vote') router.replace('/vote')
      else if (s.phase === 'results') router.replace('/results')
      return
    }
    setState(s)
    setPhase('waiting')
    setCanAdvance(false)
  }, [router])

  // Reset local state every time revealIndex changes (i.e. new player's turn)
  const revealIndex = state?.revealIndex

  useEffect(() => {
    setPhase('waiting')
    setCanAdvance(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [revealIndex])

  const handleReveal = useCallback(() => {
    if (phase !== 'waiting') return
    setPhase('showing')
    setCanAdvance(false)
    // Only enable the "done" button after HOLD_BEFORE_DONE_MS to prevent bleed-through
    timerRef.current = setTimeout(() => setCanAdvance(true), HOLD_BEFORE_DONE_MS)
  }, [phase])

  const handleHideAndNext = useCallback(() => {
    if (!canAdvance || phase !== 'showing') return
    setPhase('done')
    if (timerRef.current) clearTimeout(timerRef.current)

    const next = advanceReveal(state)
    setState(next)

    if (next.phase === 'discuss') {
      router.push('/discuss')
    }
    // else: revealIndex changed → useEffect above resets to 'waiting'
  }, [canAdvance, phase, state, router])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  if (!state) return <LoadingScreen />

  const currentPlayer = state.players[state.revealIndex]
  const isImposter = state.revealIndex === state.imposterIndex
  const total = state.players.length
  const current = state.revealIndex + 1

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-10">
      {/* Top bar */}
      <div className="w-full max w-sm text-center">
        <div className="flex justify-center gap-1 mb-4">
          {state.players.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < state.revealIndex
                  ? 'bg-purple-400 w-8'
                  : i === state.revealIndex
                  ? 'bg-white w-8'
                  : 'bg-white/10 w-4'
              }`}
            />
          ))}
        </div>
        <p className="text-white/40 text-sm">
          {current} / {total} یارمەتیدەر
        </p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center gap-6">
        {/* Player name */}
        <div className="text-center">
          <div className="text-5xl mb-3">👤</div>
          <h2 className="text-3xl font-black text-white">{currentPlayer}</h2>
          <p className="text-white/40 mt-1 text-sm">گوشارەکەت بگرە و بچە بۆ یارمەتیدەری دیکە</p>
        </div>

        {/* Flip card */}
        <div className="flip-card w-full" style={{ height: '220px' }}>
          <div className={`flip-card-inner w-full h-full ${phase !== 'waiting' ? 'flipped' : ''}`}>
            {/* Front – tap to reveal */}
            <div className="flip-card-front w-full h-full">
              <button
                onClick={handleReveal}
                className="w-full h-full game-card flex flex-col items-center justify-center gap-4
                           hover:border-purple-500/50 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <div className="text-5xl animate-pulse-slow">👁️</div>
                <p className="text-white/60 text-lg font-medium">بکە بۆ بینین</p>
                <p className="text-white/30 text-xs">یارمەتیدەرانی دیکە سەیری شاشە نەکەن</p>
              </button>
            </div>

            {/* Back – word revealed */}
            <div className="flip-card-back w-full h-full">
              <div className={`w-full h-full flex flex-col items-center justify-center gap-3 rounded-3xl p-6 ${
                isImposter ? 'imposter-card' : 'game-card border-purple-500/30'
              }`}>
                {isImposter ? (
                  <>
                    <div className="text-4xl">🎭</div>
                    <p className="text-red-300 font-bold text-lg">تۆ ئیمپۆستەرەکەیت!</p>
                    <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-5 py-3 text-center mt-1">
                      <p className="text-red-200/60 text-xs mb-1">کەتەگۆری</p>
                      <p className="text-red-100 font-black text-2xl">
                        {state.categoryEmoji} {state.category}
                      </p>
                    </div>
                    <p className="text-red-300/60 text-xs text-center mt-1">
                      وشەکە نازانیت — کەتەگۆریەکە بەکاربهێنە بۆ شاردنەوە
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl">{state.categoryEmoji}</div>
                    <p className="text-white/50 text-sm">{state.category}</p>
                    <p className="word-glow text-white font-black text-4xl mt-1 text-center leading-tight">
                      {state.word}
                    </p>
                    <p className="text-white/30 text-xs mt-2 text-center">
                      وشەکە لەبیر بکە — بۆ کەسی دیکەت پیشان نەدە
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Done button — only shown after reveal + delay */}
        <div className="h-16 flex items-center justify-center w-full">
          {phase === 'showing' && (
            <button
              onClick={handleHideAndNext}
              disabled={!canAdvance}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                canAdvance
                  ? 'btn-primary'
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              }`}
            >
              {canAdvance
                ? current === total
                  ? '✅ هەموو بینیان — باس دەست پێ بکە'
                  : `✅ تەواوبوو — بدە بە ${state.players[state.revealIndex + 1] ?? '...'}`
                : '⏳ چاوەڕوان بە...'}
            </button>
          )}
        </div>
      </div>

      <div className="h-8" />
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
