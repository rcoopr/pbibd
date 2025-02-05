import type { Division } from './types'
import { gaussianWeightedSelection } from '@/lib/draw/pbibd-lane'
import { describe, expect, it } from 'vitest'
import { fernando } from './fernando'

function pp(draw: Division) {
  return `${draw.map((round, i) => `Round ${i + 1}:
    ${round.map(heat => `[${heat.join(', ')}]`).join(',\n\t')}`).join('\n')}`
}

describe('lievheats draw hard-coded', () => {
  it('matches existing spec', () => {
    expect(pp(fernando(9, 3, 3))).toEqual(pp([
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

    expect(pp(fernando(3, 3, 3))).toEqual(pp([
      [
        [1, 2, 3],
      ],
      [
        [3, 1, 2],
      ],
      [
        [2, 3, 1],
      ],
    ]))

    expect(pp(fernando(2, 2, 5))).toEqual(pp([
      [
        [1, 2],
      ],
      [
        [1, 2],
      ],
      [
        [2, 1],
      ],
      [
        [2, 1],
      ],
      [
        [1, 2],
      ],
    ]))
  })
})

describe('gauss', () => {
  it('does the thing', () => {
    expect(gaussianWeightedSelection(6, [0, 1, 0, 0, 0, 1])).toEqual([0.153360762278211, 0.2528491508588723, 0.153360762278211, 0.03421941144762249, 0.153360762278211, 0.2528491508588723])
  })
})
