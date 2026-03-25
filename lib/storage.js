/**
 * lib/storage.js
 *
 * Storage abstraction layer.
 * Currently uses localStorage (no backend needed).
 *
 * TO ADD ONLINE SUPPORT LATER:
 *   Replace the three functions below with API fetch calls:
 *     get(roomId)        → GET  /api/rooms/:roomId
 *     set(roomId, state) → PUT  /api/rooms/:roomId
 *     delete(roomId)     → DELETE /api/rooms/:roomId
 *   Everything else in the app stays the same.
 */

const PREFIX = 'imposterkurdi_room_'

export const RoomStorage = {
  get(roomId) {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(PREFIX + roomId.toUpperCase())
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set(roomId, state) {
    if (typeof window === 'undefined') return
    localStorage.setItem(PREFIX + roomId.toUpperCase(), JSON.stringify(state))
  },

  delete(roomId) {
    if (typeof window === 'undefined') return
    localStorage.removeItem(PREFIX + roomId.toUpperCase())
  },
}
