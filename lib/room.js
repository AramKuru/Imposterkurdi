/**
 * lib/room.js
 *
 * All room & game-round logic lives here.
 * State shape:
 * {
 *   roomId: 'KURD',
 *   players: ['ئارام', 'سارا', 'کاران'],
 *   totalRounds: 5,
 *   currentRound: 0,          // 0 = lobby, 1..n = in progress
 *   leaderboard: { 'ئارام': 0, ... },
 *   round: null | { ...roundState },
 *   status: 'lobby' | 'playing' | 'roundEnd' | 'finished',
 * }
 *
 * Round state:
 * {
 *   imposterIndex, categoryKey, category, categoryEmoji, word,
 *   phase: 'reveal' | 'discuss' | 'vote' | 'results',
 *   revealIndex: 0,
 *   votes: { voterName: suspectName },
 *   // set after finishVoting():
 *   tally, topPlayer, topVotes, caughtImposter,
 * }
 */

import { RoomStorage } from './storage'
import { pickRandomRound } from '../data/words'

// ─── Room lifecycle ───────────────────────────────────────────────

export function generateRoomId() {
  // Unambiguous chars (no 0/O, 1/I/L)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export function createRoom(players, totalRounds) {
  const roomId = generateRoomId()
  const leaderboard = Object.fromEntries(players.map((p) => [p, 0]))
  const room = {
    roomId,
    players,
    totalRounds,
    currentRound: 0,
    leaderboard,
    round: null,
    status: 'lobby',
    createdAt: Date.now(),
  }
  RoomStorage.set(roomId, room)
  return room
}

export function getRoom(roomId) {
  return RoomStorage.get(roomId)
}

export function roomExists(roomId) {
  return !!RoomStorage.get(roomId)
}

// ─── Round lifecycle ──────────────────────────────────────────────

export function startNextRound(roomId) {
  const room = getRoom(roomId)
  if (!room) return null

  const lastCategory = room.round?.categoryKey ?? null
  const lastWord = room.round?.word ?? null
  const { categoryKey, category, categoryEmoji, word } = pickRandomRound(lastCategory, lastWord)
  const imposterIndex = Math.floor(Math.random() * room.players.length)

  const next = {
    ...room,
    currentRound: room.currentRound + 1,
    status: 'playing',
    round: {
      imposterIndex,
      categoryKey,
      category,
      categoryEmoji,
      word,
      phase: 'reveal',
      revealIndex: 0,
      votes: {},
    },
  }
  RoomStorage.set(roomId, next)
  return next
}

export function advanceReveal(roomId) {
  const room = getRoom(roomId)
  if (!room?.round) return null

  const nextIndex = room.round.revealIndex + 1
  const phase = nextIndex >= room.players.length ? 'discuss' : 'reveal'

  const next = { ...room, round: { ...room.round, revealIndex: nextIndex, phase } }
  RoomStorage.set(roomId, next)
  return next
}

export function startVote(roomId) {
  const room = getRoom(roomId)
  if (!room?.round) return null

  const next = { ...room, round: { ...room.round, phase: 'vote' } }
  RoomStorage.set(roomId, next)
  return next
}

export function submitVote(roomId, voterName, suspectName) {
  const room = getRoom(roomId)
  if (!room?.round) return null

  const votes = { ...room.round.votes, [voterName]: suspectName }
  const next = { ...room, round: { ...room.round, votes } }
  RoomStorage.set(roomId, next)
  return next
}

export function finishVoting(roomId) {
  const room = getRoom(roomId)
  if (!room?.round) return null

  const { votes, imposterIndex } = room.round
  const imposterName = room.players[imposterIndex]

  // Vote tally
  const tally = {}
  for (const suspect of Object.values(votes)) {
    tally[suspect] = (tally[suspect] ?? 0) + 1
  }

  // Most-voted player
  let topPlayer = null
  let topVotes = 0
  for (const [name, count] of Object.entries(tally)) {
    if (count > topVotes) { topVotes = count; topPlayer = name }
  }

  const caughtImposter = topPlayer === imposterName

  // Scoring: catch imposter → each non-imposter +1 | imposter survives → imposter +3
  const leaderboard = { ...room.leaderboard }
  if (caughtImposter) {
    for (const player of room.players) {
      if (player !== imposterName) leaderboard[player] = (leaderboard[player] ?? 0) + 1
    }
  } else {
    leaderboard[imposterName] = (leaderboard[imposterName] ?? 0) + 3
  }

  const isLastRound = room.currentRound >= room.totalRounds

  const next = {
    ...room,
    leaderboard,
    status: isLastRound ? 'finished' : 'roundEnd',
    round: {
      ...room.round,
      phase: 'results',
      tally,
      topPlayer,
      topVotes,
      caughtImposter,
      imposterName,
    },
  }
  RoomStorage.set(roomId, next)
  return next
}

// Reset leaderboard + round counter but keep players & room code
export function resetLeaderboard(roomId) {
  const room = getRoom(roomId)
  if (!room) return null
  const leaderboard = Object.fromEntries(room.players.map((p) => [p, 0]))
  const next = { ...room, currentRound: 0, leaderboard, round: null, status: 'lobby' }
  RoomStorage.set(roomId, next)
  return next
}

// Helpers
export function getSortedLeaderboard(room) {
  return Object.entries(room.leaderboard)
    .sort(([, a], [, b]) => b - a)
    .map(([name, score]) => ({ name, score }))
}
