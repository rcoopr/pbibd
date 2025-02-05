import type { Division } from './types'
import { roundSeedOrderNew } from '@/lib/draw/fernando-balanced'
import { describe, expect, it } from 'vitest'
import { fernandoBalanced } from './fernando-balanced'

function pp(draw: Division) {
  return `${draw.map((round, i) => `Round ${i + 1}:
    ${round.map(heat => `[${heat.join(', ')}]`).join(',\n\t')}`).join('\n')}`
}

describe('roundSeedOrderNew', () => {
  it('matches existing spec', () => {
    const r = roundSeedOrderNew(3, 2)
    expect(r).toEqual([0, 1, 0, 1, 0, 1])
    expect(pp(fernandoBalanced(9, 3, 3))).toEqual(pp([
      [[1, 4, 7], [2, 5, 8], [3, 6, 9]],
      [
        [8, 1, 6],
        [9, 2, 4],
        [7, 3, 5],
      ],
      [
        [5, 9, 1],
        [6, 7, 2],
        [4, 8, 3],
      ],
    ]))
  })
})
