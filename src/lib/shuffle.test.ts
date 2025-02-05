import { calculateProbabilities, cycleArray, rotateAthletes } from '@/lib/shuffle'
import { describe, expect, it } from 'vitest'

describe('shuffle array util', () => {
  it('moves elements n along, wrapping around', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(cycleArray(arr, 0)).toEqual([1, 2, 3, 4, 5])
    expect(cycleArray(arr, 1)).toEqual([2, 3, 4, 5, 1])
    expect(cycleArray(arr, 2)).toEqual([3, 4, 5, 1, 2])
  })

  it('handles n > arr.length', () => {
    const arr = [1, 2, 3, 4]
    expect(cycleArray(arr, 4)).toEqual([1, 2, 3, 4])
    expect(cycleArray(arr, 5)).toEqual([2, 3, 4, 1])
  })
})

describe('shuffling athletes to correct lane assignments', () => {
  it('creates even assignments', () => {
    const draw = [
      [[5, 3, 6, 4, 1, 2]],
      [[5, 3, 6, 2, 1, 4]],
      [[6, 2, 1, 4, 3, 5]],
    ]

    expect(rotateAthletes(draw)).toEqual([
      [[5, 3, 6, 4, 1, 2]],
      [[3, 5, 2, 6, 4, 1]],
      [[6, 2, 1, 3, 5, 4]],
    ])
  })

  it('fixes incorrect assignments', () => {
    const draw = [
      [[1, 2, 3]],
      [[1, 2, 3]],
      [[1, 2, 3]],
    ]
    expect(rotateAthletes(draw)).toEqual([
      [[1, 2, 3]],
      [[2, 3, 1]],
      [[3, 1, 2]],
    ])
  })
})

describe('gaussianWeightedSelection', () => {
  it('generates probabilities', () => {
    const p = calculateProbabilities([0, 1, 0, 0, 0, 1], 0.5)
    // console.log(p)
    expect(p[0]).toBeGreaterThan(p[1])
    expect(p[1]).toBeLessThan(p[2])
    // expect(p[2]).toBeLessThan(p[3])
    // expect(p[3]).toBeGreaterThan(p[4])
    expect(p[4]).toBeGreaterThan(p[5])
  })
})
