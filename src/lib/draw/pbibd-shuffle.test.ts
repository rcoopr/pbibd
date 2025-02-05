import { createTournamentDraw } from '@/lib/draw/pbibd'
import { pbibdShuffle } from '@/lib/draw/pbibd-shuffle'
import { describe, expect, it } from 'vitest'

describe('pbibd rewrite', () => {
  it('is the same as the old one', () => {
    expect(true).toBe(true)

    const orig = createTournamentDraw(27, 4, 8).generateTournament().map(r => r.map(h => h.map(a => a.id)))
    const updated = pbibdShuffle(27, 4, 8)

    expect(orig).toEqual(updated)
  })
})
