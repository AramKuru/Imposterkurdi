'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getRoom, getSortedLeaderboard } from '../../../../lib/room'

export default function RoundResults() {
  const router = useRouter()
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!roomId) return
    const r = getRoom(roomId)
    if (!r) { router.replace('/'); return }
    if (r.round?.phase !== 'results') {
      redirectToPhase(router, roomId, r.round?.phase ?? r.status)
      return
    }
    setRoom(r)
  }, [roomId, router])

  if (!room?.round) return <LoadingScreen />

  const { round, players, currentRound, totalRounds } = room
  const { tally = {}, topPlayer, caughtImposter, imposterName } = round
  const isLastRound = currentRound >= totalRounds
  const sorted = getSortedLeaderboard(room)

  const handleNext = () => {
    if (isLastRound) {
      router.push(`/room/${roomId}/final`)
    } else {
      router.push(`/room/${roomId}`)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-between text-xs text-white/30 mb-2">
          <span>ژووری {roomId}</span>
          <span>دۆرە {currentRound}/{totalRounds}</span>
        </div>
        <h1 className="text-2xl font-black text-white">ئەنجامی دۆرە</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-sm">
        {/* Tap to reveal imposter */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full game-card p-10 flex flex-col items-center gap-4
                       hover:border-purple-500/50 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <div className="text-6xl animate-pulse-slow">🎭</div>
            <p className="text-white/60 font-bold text-lg">بکە بۆ دیتنی ئیمپۆستەر</p>
          </button>
        ) : (
          <>
            {/* Result banner */}
            <div className={`w-full rounded-3xl p-6 text-center ${
              caughtImposter
                ? 'bg-green-900/30 border border-green-500/40'
                : 'imposter-card'
            }`}>
              <div className="text-5xl mb-3">{caughtImposter ? '🎉' : '😈'}</div>
              <p className={`text-2xl font-black ${caughtImposter ? 'text-green-300' : 'text-red-300'}`}>
                {caughtImposter ? 'کۆمەڵ بردی!' : 'ئیمپۆستەر بردی!'}
              </p>
              <p className="text-white/50 text-sm mt-2">
                {caughtImposter
                  ? `دەنگی زۆرینە بۆ ${topPlayer}`
                  : `ئیمپۆستەر شارد — ${topPlayer ? `${topPlayer} زۆرترین دەنگی وەرگرت` : 'کەس دەنگ نەدا'}`}
              </p>
              <p className="text-white/30 text-xs mt-1">
                {caughtImposter
                  ? 'هەر یارمەتیدەرێک جگە لە ئیمپۆستەر +١ نمرەی وەرگرت'
                  : `${imposterName} +٣ نمرەی وەرگرت`}
              </p>
            </div>

            {/* Imposter */}
            <div className="w-full game-card p-5 flex items-center gap-4">
              <div className="text-4xl">🎭</div>
              <div>
                <p className="text-white/50 text-sm">ئیمپۆستەرەکە بوو</p>
                <p className="text-white font-black text-2xl">{imposterName}</p>
              </div>
            </div>

            {/* Word */}
            <div className="w-full game-card p-5 text-center">
              <p className="text-white/40 text-sm mb-1">{round.categoryEmoji} {round.category}</p>
              <p className="word-glow text-white font-black text-3xl">{round.word}</p>
              <p className="text-white/30 text-xs mt-2">وشەی ئەم دۆرە</p>
            </div>

            {/* Vote tally */}
            <div className="w-full game-card p-5">
              <p className="text-white/50 text-sm font-bold mb-3">📊 هەژمارکردنی دەنگەکان</p>
              <div className="flex flex-col gap-2">
                {players.map((player) => {
                  const count = tally[player] ?? 0
                  const pct = players.length > 0 ? (count / players.length) * 100 : 0
                  const isImp = player === imposterName
                  return (
                    <div key={player} className="flex items-center gap-3">
                      <span className={`text-sm w-20 shrink-0 font-medium ${isImp ? 'text-red-300' : 'text-white/70'}`}>
                        {player} {isImp ? '🎭' : ''}
                      </span>
                      <div className="flex-1 bg-white/5 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${isImp ? 'bg-red-500' : 'bg-purple-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-white/40 text-xs w-5 text-center">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Live leaderboard */}
            <div className="w-full game-card p-5">
              <p className="text-white/50 text-sm font-bold mb-3">🏆 لیستی نمرەکان</p>
              <div className="flex flex-col gap-2.5">
                {sorted.map(({ name, score }, i) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-lg w-6 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <span className="flex-1 text-white/80 font-medium">{name}</span>
                    <span className="text-purple-300 font-black text-xl">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {revealed && (
        <div className="w-full max-w-sm">
          <button onClick={handleNext} className="btn-primary w-full py-5 text-xl rounded-2xl">
            {isLastRound ? '🏆 ئەنجامی کۆتایی ببینە' : `▶️ دۆرەی ${currentRound + 1} دەست پێ بکە`}
          </button>
        </div>
      )}
    </main>
  )
}

function redirectToPhase(router, roomId, phase) {
  if (phase === 'reveal') router.replace(`/room/${roomId}/reveal`)
  else if (phase === 'discuss') router.replace(`/room/${roomId}/discuss`)
  else if (phase === 'vote') router.replace(`/room/${roomId}/vote`)
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
