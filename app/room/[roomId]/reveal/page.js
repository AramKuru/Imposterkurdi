'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getRoom, advanceReveal } from '../../../../lib/room'

// Min ms the word must be visible before the "Done" button unlocks.
// Prevents the tap-to-reveal touch event from bleeding into the next action.
const HOLD_BEFORE_DONE_MS = 1200

export default function Reveal() {
  const router = useRouter()
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)
  const [cardPhase, setCardPhase] = useState('waiting') // waiting | showing
  const [canAdvance, setCanAdvance] = useState(false)
  const timerRef = useRef(null)

  // Load room & guard phase
  useEffect(() => {
    if (!roomId) return
    const r = getRoom(roomId)
    if (!r) { router.replace('/'); return }
    if (r.round?.phase !== 'reveal') {
      redirectToPhase(router, roomId, r.round?.phase ?? r.status)
      return
    }
    setRoom(r)
    setCardPhase('waiting')
    setCanAdvance(false)
  }, [roomId, router])

  // Reset card whenever the player index changes
  const revealIndex = room?.round?.revealIndex
  useEffect(() => {
    setCardPhase('waiting')
    setCanAdvance(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [revealIndex])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // Tap to reveal — locks "done" button for HOLD_BEFORE_DONE_MS
  const handleReveal = useCallback(() => {
    if (cardPhase !== 'waiting') return
    setCardPhase('showing')
    setCanAdvance(false)
    timerRef.current = setTimeout(() => setCanAdvance(true), HOLD_BEFORE_DONE_MS)
  }, [cardPhase])

  // Done — advance to next player (or discuss phase)
  const handleDone = useCallback(() => {
    if (!canAdvance || cardPhase !== 'showing') return
    if (timerRef.current) clearTimeout(timerRef.current)
    setCardPhase('waiting') // reset for next player

    const next = advanceReveal(roomId)
    setRoom(next)

    if (next.round?.phase === 'discuss') {
      router.push(`/room/${roomId}/discuss`)
    }
    // else: revealIndex changed → useEffect resets card
  }, [canAdvance, cardPhase, roomId, router])

  if (!room?.round) return <LoadingScreen />

  const { round, players } = room
  const currentPlayer = players[round.revealIndex]
  const isImposter = round.revealIndex === round.imposterIndex
  const total = players.length
  const current = round.revealIndex + 1
  const nextPlayerName = players[round.revealIndex + 1]

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-10">
      {/* Progress bar */}
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center gap-1 mb-3">
          {players.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i < round.revealIndex
                  ? 'bg-purple-400 w-8'
                  : i === round.revealIndex
                  ? 'bg-white w-8'
                  : 'bg-white/10 w-4'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between items-center text-xs text-white/30">
          <span>دۆرە {room.currentRound}/{room.totalRounds}</span>
          <span>{current}/{total} یارمەتیدەر</span>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center gap-6">
        {/* Player name */}
        <div className="text-center">
          <div className="text-5xl mb-3">👤</div>
          <h2 className="text-3xl font-black text-white">{currentPlayer}</h2>
          <p className="text-white/40 mt-1 text-sm">گوشارەکەت بگرە — یارمەتیدەری دیکە نەبینن</p>
        </div>

        {/* Flip card */}
        <div className="flip-card w-full" style={{ height: '220px' }}>
          <div className={`flip-card-inner w-full h-full ${cardPhase !== 'waiting' ? 'flipped' : ''}`}>
            {/* Front */}
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

            {/* Back */}
            <div className="flip-card-back w-full h-full">
              {isImposter ? (
                <div className="w-full h-full imposter-card flex flex-col items-center justify-center gap-3 rounded-3xl p-6">
                  <div className="text-4xl">🎭</div>
                  <p className="text-red-300 font-bold text-lg">تۆ ئیمپۆستەرەکەیت!</p>
                  <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-5 py-3 text-center mt-1">
                    <p className="text-red-200/60 text-xs mb-1">کەتەگۆری</p>
                    <p className="text-red-100 font-black text-2xl">
                      {round.categoryEmoji} {round.category}
                    </p>
                  </div>
                  <p className="text-red-300/60 text-xs text-center">
                    وشەکە نازانیت — کەتەگۆریەکە بەکاربهێنە بۆ شاردنەوە
                  </p>
                </div>
              ) : (
                <div className="w-full h-full game-card border-purple-500/30 flex flex-col items-center justify-center gap-3 rounded-3xl p-6">
                  <div className="text-4xl">{round.categoryEmoji}</div>
                  <p className="text-white/50 text-sm">{round.category}</p>
                  <p className="word-glow text-white font-black text-4xl mt-1 text-center leading-tight">
                    {round.word}
                  </p>
                  <p className="text-white/30 text-xs mt-2 text-center">
                    لەبیر بکە — بۆ کەسی دیکەت پیشان نەدە
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Done button — appears only after reveal, unlocks after delay */}
        <div className="h-16 flex items-center justify-center w-full">
          {cardPhase === 'showing' && (
            <button
              onClick={handleDone}
              disabled={!canAdvance}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                canAdvance
                  ? 'btn-primary'
                  : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
              }`}
            >
              {canAdvance
                ? current === total
                  ? '✅ هەموو بینیان — باس دەست پێ بکات'
                  : `✅ تەواوبوو — بدە بە ${nextPlayerName}`
                : '⏳ چاوەڕوان بە...'}
            </button>
          )}
        </div>
      </div>

      <div className="h-6" />
    </main>
  )
}

function redirectToPhase(router, roomId, phase) {
  if (phase === 'discuss') router.replace(`/room/${roomId}/discuss`)
  else if (phase === 'vote') router.replace(`/room/${roomId}/vote`)
  else if (phase === 'results') router.replace(`/room/${roomId}/results`)
  else if (phase === 'finished') router.replace(`/room/${roomId}/final`)
  else router.replace(`/room/${roomId}`)
}

function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-2xl animate-pulse-slow">⏳</div>
    </main>
  )
}
