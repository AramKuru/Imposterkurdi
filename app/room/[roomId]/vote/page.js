'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getRoom, submitVote, finishVoting } from '../../../../lib/room'

export default function Vote() {
  const router = useRouter()
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)
  const [voterIndex, setVoterIndex] = useState(0)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!roomId) return
    const r = getRoom(roomId)
    if (!r) { router.replace('/'); return }
    if (r.round?.phase !== 'vote') {
      redirectToPhase(router, roomId, r.round?.phase ?? r.status)
      return
    }
    setRoom(r)
  }, [roomId, router])

  if (!room?.round) return <LoadingScreen />

  const { players, round } = room
  const voter = players[voterIndex]
  const suspects = players.filter((_, i) => i !== voterIndex)
  const voteCount = Object.keys(round.votes).length
  const progress = voteCount / players.length
  const isLast = voterIndex === players.length - 1

  const confirmVote = () => {
    if (!selected) return
    const next = submitVote(roomId, voter, selected)
    setRoom(next)

    if (isLast) {
      const final = finishVoting(roomId)
      setRoom(final)
      router.push(`/room/${roomId}/results`)
    } else {
      setVoterIndex(voterIndex + 1)
      setSelected(null)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between px-4 py-10">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-between text-xs text-white/30 mb-2">
          <span>ژووری {roomId}</span>
          <span>دۆرە {room.currentRound}/{room.totalRounds}</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-3">🗳️ دەنگدان</h1>
        <div className="w-full bg-white/5 rounded-full h-1.5">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-white/30 text-xs mt-2">{voteCount}/{players.length} دەنگیان دا</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full max-w-sm">
        {/* Current voter */}
        <div className="game-card p-5 w-full text-center">
          <div className="text-4xl mb-2">🙋</div>
          <p className="text-white/40 text-sm mb-1">ئێستا نۆبەتی</p>
          <p className="text-2xl font-black text-white">{voter}</p>
          <p className="text-white/40 text-sm mt-2">کێی بۆ ئیمپۆستەر دادەنێیت؟</p>
        </div>

        {/* Suspects */}
        <div className="w-full flex flex-col gap-3">
          {suspects.map((suspect) => (
            <button
              key={suspect}
              onClick={() => setSelected(suspect)}
              className={`vote-item w-full game-card p-4 flex items-center justify-between
                          border transition-all duration-150 rounded-2xl text-right
                          ${selected === suspect ? 'selected' : ''}`}
            >
              <span className="text-white font-bold text-lg">{suspect}</span>
              <span className={`text-2xl transition-transform duration-150 ${selected === suspect ? 'scale-125' : ''}`}>
                {selected === suspect ? '🎯' : '○'}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={confirmVote}
          disabled={!selected}
          className="w-full btn-primary py-5 text-xl rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLast
            ? `✅ دەنگ بدە بۆ ${selected ?? '...'} — ئەنجام ببینە`
            : `✅ دەنگ بدە بۆ ${selected ?? '...'}`}
        </button>
      </div>

      <div className="h-4" />
    </main>
  )
}

function redirectToPhase(router, roomId, phase) {
  if (phase === 'reveal') router.replace(`/room/${roomId}/reveal`)
  else if (phase === 'discuss') router.replace(`/room/${roomId}/discuss`)
  else if (phase === 'results') router.replace(`/room/${roomId}/results`)
  else router.replace(`/room/${roomId}`)
}

function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-2xl animate-pulse-slow">⏳</div>
    </main>
  )
}
