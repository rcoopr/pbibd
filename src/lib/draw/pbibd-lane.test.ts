import { rotateAthletes } from '@/lib/draw/pbibd-lane'
import { describe, expect, it } from 'vitest'

describe('rotateAthletes', () => {
  it('rotates athletes', () => {
    const draw = [

      [[5, 3, 6, 4, 1, 2]],

      [[5, 3, 6, 2, 1, 4]],

      [[6, 2, 1, 4, 3, 5]],

    ]

    expect(rotateAthletes(draw)).toEqual([
      [[5, 3, 6, 4, 1, 2]],
      [[5, 3, 6, 2, 1, 4]],
      [[6, 2, 1, 4, 3, 5]],
    ])
  })
})
