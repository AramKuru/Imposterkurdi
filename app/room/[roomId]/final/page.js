'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getRoom, getSortedLeaderboard, resetLeaderboard } from '../../../../lib/room'

const MEDALS = ['🥇', '🥈', '🥉']

export default function FinalLeaderboard() {
  const router = useRouter()
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)

  useEffect(() => {
    if (!roomId) return
    const r = getRoom(roomId)
    if (!r) { router.replace('/'); return }
    setRoom(r)
  }, [roomId, router])

  if (!room) return <LoadingScreen />

  const sorted = getSortedLeaderboard(room)
  const winner = sorted[0]
  const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score

  const playAgain = () => {
    // Reset leaderboard + round counter, keep same players & room code
    const next = resetLeaderboard(roomId)
    setRoom(next)
    router.push(`/room/${roomId}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="text-xs text-white/30 mb-2">ژووری {roomId}</div>
        <h1 className="text-2xl font-black text-white">🏆 ئەنجامی کۆتایی</h1>
        <p className="text-white/40 text-sm mt-1">{room.totalRounds} دۆرە تەواو بوو</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm">
        {/* Winner banner */}
        <div className="w-full text-center game-card p-8 border-yellow-500/20">
          {isTie ? (
            <>
              <div className="text-6xl mb-3">🤝</div>
              <p className="text-yellow-300 font-black text-2xl">یەکسان بوون!</p>
              <p className="text-white/50 text-sm mt-2">
                {sorted.filter((e) => e.score === winner.score).map((e) => e.name).join(' و ')}
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-3">👑</div>
              <p className="text-yellow-300 font-black text-3xl">{winner.name}</p>
              <p className="text-white/50 text-sm mt-2">
                {winner.score} نمرە · جووتی بردووەوە!
              </p>
            </>
          )}
        </div>

        {/* Full leaderboard */}
        <div className="w-full game-card p-5">
          <p className="text-white/50 text-sm font-bold mb-4">لیستی نمرەی کۆتایی</p>
          <div className="flex flex-col gap-3">
            {sorted.map(({ name, score }, i) => {
              const isWinner = score === winner.score
              return (
                <div
                  key={name}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all
                    ${isWinner ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-white/3'}`}
                >
                  <span className="text-2xl w-8 text-center">
                    {MEDALS[i] ?? `${i + 1}.`}
                  </span>
                  <span className={`flex-1 font-bold text-lg ${isWinner ? 'text-yellow-200' : 'text-white/80'}`}>
                    {name}
                  </span>
                  <span className={`font-black text-2xl ${isWinner ? 'text-yellow-300' : 'text-white/50'}`}>
                    {score}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scoring legend */}
        <div className="w-full game-card p-4">
          <p className="text-white/30 text-xs font-bold mb-2">چۆنیەتی نمرەدان</p>
          <div className="flex flex-col gap-1.5 text-xs text-white/40">
            <div className="flex justify-between">
              <span>کۆمەڵ ئیمپۆستەرەکە بگیرێت</span>
              <span className="text-green-400 font-bold">هەر یارمەتیدەرێک +١</span>
            </div>
            <div className="flex justify-between">
              <span>ئیمپۆستەر فیرار بکات</span>
              <span className="text-red-400 font-bold">ئیمپۆستەر +٣</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <button onClick={playAgain} className="btn-primary w-full py-5 text-xl rounded-2xl">
          🔄 دۆباری یاری — هەمان یارمەتیدەران
        </button>
        <button onClick={() => router.push('/create')} className="btn-secondary w-full py-4 rounded-2xl">
          🏠 ژووری نوێ
        </button>
        <button onClick={() => router.push('/')} className="text-white/30 hover:text-white/60 transition text-sm text-center py-2">
          بگەڕێوە سەر پەیجی سەرەکی
        </button>
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
