'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getRoom, startNextRound, getSortedLeaderboard } from '../../../lib/room'

export default function RoomLobby() {
  const router = useRouter()
  const { roomId } = useParams()
  const [room, setRoom] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!roomId) return
    const r = getRoom(roomId)
    if (!r) { router.replace('/'); return }
    // Redirect if a game is already in progress
    if (r.status === 'playing') redirectToPhase(router, roomId, r.round?.phase)
    else if (r.status === 'finished') router.replace(`/room/${roomId}/final`)
    else setRoom(r)
  }, [roomId, router])

  const copyCode = () => {
    navigator.clipboard?.writeText(roomId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const startGame = () => {
    const next = startNextRound(roomId)
    if (next) router.push(`/room/${roomId}/reveal`)
  }

  if (!room) return <LoadingScreen />

  const sorted = getSortedLeaderboard(room)
  const hasScores = sorted.some((e) => e.score > 0)
  const roundsLeft = room.totalRounds - room.currentRound

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/')} className="text-white/40 hover:text-white transition text-2xl">
          ←
        </button>
        <h1 className="text-2xl font-black text-white">ژووری بازی</h1>
      </div>

      {/* Room code */}
      <div className="w-full max-w-sm game-card p-6 mb-6 text-center">
        <p className="text-white/40 text-sm mb-2">کۆدی ژوور</p>
        <button
          onClick={copyCode}
          className="flex items-center justify-center gap-3 mx-auto group"
        >
          <span className="text-5xl font-black tracking-widest text-white word-glow">
            {roomId}
          </span>
          <span className="text-white/30 group-hover:text-purple-400 transition text-xl">
            {copied ? '✅' : '📋'}
          </span>
        </button>
        <p className="text-white/30 text-xs mt-3">
          {copied ? 'کۆپی کرا!' : 'بکە بۆ کۆپیکردن'}
        </p>
      </div>

      {/* Round info */}
      <div className="w-full max-w-sm flex gap-3 mb-6">
        <div className="game-card flex-1 p-4 text-center">
          <p className="text-3xl font-black text-white">{room.totalRounds}</p>
          <p className="text-white/40 text-xs mt-1">کۆی دۆرەکان</p>
        </div>
        <div className="game-card flex-1 p-4 text-center">
          <p className="text-3xl font-black text-purple-300">{room.currentRound}</p>
          <p className="text-white/40 text-xs mt-1">تەواوبووان</p>
        </div>
        <div className="game-card flex-1 p-4 text-center">
          <p className="text-3xl font-black text-green-300">{roundsLeft}</p>
          <p className="text-white/40 text-xs mt-1">ماوەی</p>
        </div>
      </div>

      {/* Players */}
      <div className="w-full max-w-sm game-card p-5 mb-6">
        <p className="text-white/50 text-sm font-bold mb-3">👥 یارمەتیدەران ({room.players.length})</p>
        <div className="flex flex-wrap gap-2">
          {room.players.map((p, i) => (
            <span key={i} className="bg-purple-800/30 border border-purple-700/30 rounded-full px-3 py-1.5 text-sm text-white/80 font-medium">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Leaderboard (after first round) */}
      {hasScores && (
        <div className="w-full max-w-sm game-card p-5 mb-6">
          <p className="text-white/50 text-sm font-bold mb-3">🏆 لیستی نمرەکان</p>
          <div className="flex flex-col gap-2">
            {sorted.map(({ name, score }, i) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span className="flex-1 text-white/80 font-medium">{name}</span>
                <span className="text-purple-300 font-black text-lg">{score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start / Continue */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {roundsLeft > 0 ? (
          <button onClick={startGame} className="btn-primary w-full py-5 text-xl rounded-2xl">
            {room.currentRound === 0 ? '🚀 یاری دەست پێ بکە' : `▶️ دۆرەی ${room.currentRound + 1} دەست پێ بکە`}
          </button>
        ) : (
          <button onClick={() => router.push(`/room/${roomId}/final`)} className="btn-primary w-full py-5 text-xl rounded-2xl">
            🏆 ئەنجامی کۆتایی ببینە
          </button>
        )}
      </div>
    </main>
  )
}

function redirectToPhase(router, roomId, phase) {
  if (phase === 'reveal') router.replace(`/room/${roomId}/reveal`)
  else if (phase === 'discuss') router.replace(`/room/${roomId}/discuss`)
  else if (phase === 'vote') router.replace(`/room/${roomId}/vote`)
  else if (phase === 'results') router.replace(`/room/${roomId}/results`)
}

function LoadingScreen() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-white/40 text-2xl animate-pulse-slow">⏳</div>
    </main>
  )
}
