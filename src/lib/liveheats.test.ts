import { describe, expect, it } from 'vitest'
import { generateRoundRobinSeeding } from './liveheats'

describe('liveheats current draw algo', () => {
  it('matches existing spec', () => {
    const contest = generateRoundRobinSeeding(9, 3, 3)
    expect(contest).toEqual([
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
    ])
  })
})
