import type { Division } from './types'
import { describe, expect, it } from 'vitest'
import { fernandoBalanced } from './fernando-balanced'
import { roundSeedOrderNew } from '@/lib/draw/fernando-balanced'


function pp(draw: Division) {
  return `${draw.map((round, i) => `Round ${i + 1}:
    ${round.map(heat => `[${heat.join(', ')}]`).join(',\n\t')}`).join('\n')}`
}

describe('roundSeedOrderNew', () => {
  it('matches existing spec', () => {
    const r = roundSeedOrderNew(3, 2)
    expect(r).toEqual([0, 1, 0, 1, 0, 1])
    expect(pp(fernandoBalanced(9, 5, 3))).toEqual(pp([
          [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ],
          [
            [6, 1, 8],
            [9, 4, 2],
            [3, 7, 5],
          ],
          [
            [5, 9, 1],
            [8, 3, 4],
            [2, 6, 7],
          ],
        ]))
  })
})
