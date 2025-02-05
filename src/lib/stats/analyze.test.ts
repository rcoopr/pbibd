import { analyzeDivision } from '@/lib/stats/analyze'
import { describe, expect, it } from 'vitest'

describe('analyzeDivision', () => {
  it('works for this draw', () => {
    const draw = [
      [[6, 7], [3, 1], [2, 5], [4, 8]],
      [[7, 3], [2, 6], [1, 8], [5, 4]],
      [[6, 5], [1, 8], [4, 3], [7, 2]],
      [[5, 1], [3, 6], [8, 2], [4, 7]],
    ]

    expect(analyzeDivision(draw).lanes.asnSumSqAvg).toBe(8.5)
  })
})
