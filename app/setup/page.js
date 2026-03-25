'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGame } from '../../lib/game'

const MIN_PLAYERS = 3
const MAX_PLAYERS = 10

export default function Setup() {
  const router = useRouter()
  const [players, setPlayers] = useState(['', ''])
  const [error, setError] = useState('')

  const addPlayer = () => {
    if (players.length >= MAX_PLAYERS) return
    setPlayers([...players, ''])
  }

  const removePlayer = (i) => {
    if (players.length <= MIN_PLAYERS) return
    setPlayers(players.filter((_, idx) => idx !== i))
  }

  const updatePlayer = (i, val) => {
    const next = [...players]
    next[i] = val
    setPlayers(next)
  }

  const startGame = () => {
    const filled = players.map((p) => p.trim()).filter(Boolean)
    if (filled.length < MIN_PLAYERS) {
      setError(`کەمەتر لە ${MIN_PLAYERS} یارمەتیدەر ناکات`)
      return
    }
    // Check duplicates
    const unique = new Set(filled.map((p) => p.toLowerCase()))
    if (unique.size < filled.length) {
      setError('ناوی دووجار هەیە - هەر ناوێک جیاوازی خۆی هەبێت')
      return
    }
    setError('')
    createGame(filled)
    router.push('/reveal')
  }

  const filledCount = players.filter((p) => p.trim()).length

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-10">
      {/* Header */}
      <div className="w-full max-w-sm flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/')} className="text-white/40 hover:text-white transition text-2xl">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">دانانی یارمەتیدەران</h1>
          <p className="text-white/40 text-sm">
            {filledCount} / {MAX_PLAYERS} یارمەتیدەر
          </p>
        </div>
      </div>

      {/* Player inputs */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-6">
        {players.map((name, i) => (
          <div key={i} className="flex items-center gap-2 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full bg-purple-800/50 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
              {i + 1}
            </div>
            <input
              className="input-field flex-1"
              type="text"
              placeholder={`یارمەتیدەر ${i + 1}`}
              value={name}
              maxLength={20}
              onChange={(e) => updatePlayer(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (i === players.length - 1 && players.length < MAX_PLAYERS) addPlayer()
                }
              }}
            />
            <button
              onClick={() => removePlayer(i)}
              disabled={players.length <= MIN_PLAYERS}
              className="text-white/20 hover:text-red-400 transition disabled:opacity-20 disabled:cursor-not-allowed text-xl w-8 shrink-0 text-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add player */}
      {players.length < MAX_PLAYERS && (
        <button
          onClick={addPlayer}
          className="w-full max-w-sm border-2 border-dashed border-white/10 hover:border-purple-500/50
                     text-white/40 hover:text-purple-300 rounded-xl py-3 mb-6 transition-all duration-200
                     flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>یارمەتیدەری زیاد بکە</span>
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="w-full max-w-sm mb-4 bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 text-red-300 text-sm text-center">
          {error}
        </div>
      )}

      {/* Start */}
      <button
        onClick={startGame}
        disabled={filledCount < MIN_PLAYERS}
        className="w-full max-w-sm btn-primary text-xl py-5 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
      >
        🚀 یاری دەست پێ بکە
      </button>

      <p className="mt-6 text-white/30 text-xs text-center">
        لانیکەم {MIN_PLAYERS} کەس · زۆرترین {MAX_PLAYERS} کەس
      </p>
    </main>
  )
}
