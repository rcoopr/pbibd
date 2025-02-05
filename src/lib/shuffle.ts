/* eslint-disable no-console */
export function rotateAthletes(rounds: number[][][]): number[][][] {
  let best: [number, number[][][], number[][]] = [Infinity, rounds, []]

  for (let r = 0; r < rounds.length; r++) {
    for (let h = 0; h <= rounds[0].length; h++) {
      for (let a = 0; a <= rounds[0][0].length; a++) {
        const [metric, draw, history] = _rotateAthletes(rounds, r, h, a)
        if (metric < best[0]) {
          best = [metric, draw, history]
        }
      }
    }
  }

  // console.log(best[0], best[1])
  return best[1]
}

export function _rotateAthletes(_rounds: number[][][], rBy = 0, hBy = 0, aBy = 0): [number, number[][][], number[][]] {
  const rounds = cycleArray(_rounds, rBy)
  const athletes = Array.from(new Set(rounds.flat(Infinity))) as number[]

  // each athlete has an array that stores the count of 'usages' of a lane
  const history = new Map<number, number[]>(athletes.map(athlete => ([athlete, []])))

  const shuffled = rounds.map((_round, r_i) => {
    const round = cycleArray(_round, hBy + r_i)
    if (r_i === 0) {
      // Initialize lane history for the first round
      round.forEach(heat => heat.forEach((athlete, lane) => {
        history.set(athlete, Array.from({ length: heat.length }).map((_, i) => i === lane ? 1 : 0))
      }))

      return round
    }

    return round.map((_heat, h_i) => {
      const heat = cycleArray(_heat, aBy + h_i * rBy)
      const newLanes: number[] = [...heat].fill(0)

      heat.forEach((athlete) => {
        const prevLanes = history.get(athlete)!
        while (prevLanes.length < newLanes.length)
          prevLanes.push(0)

        let min = Math.min(...prevLanes)
        min = min === Infinity ? 0 : min

        let position = -1
        let tries = 0
        while (position === -1 && tries < 100) {
          tries++
          const nextLane = prevLanes.findIndex((l, l_i) => {
            if (tries > 99)
              console.log({ athlete, l, l_i, prevLanes, newLanes, min, tries })
            return l <= min && newLanes[l_i] === 0
          })
          if (nextLane === -1) {
            min++
          }
          else {
            position = nextLane
          }
        }

        newLanes[position] = athlete
        prevLanes[position] = (prevLanes[position] || 0) + 1
      })
      return newLanes
    })
  })

  const metric = Array.from(history.values()).map(lanes => lanes.reduce((sum, count) => sum + count ** 2, 0)).reduce((acc, val) => acc + val, 0)
  // console.log(metric, Array.from(history.values()))

  return [metric, shuffled, Array.from(history.values())]
}

export function cycleArray<T>(arr: T[], by: number): T[] {
  const step = by % arr.length
  return [...arr.slice(step), ...arr.slice(0, step)]
}

// Semi WIP
export function gaussianWeightedSelection(n: number, p: number[], sigma: number = 1.0): number[] {
  /**
   * Generate a Gaussian distribution of probabilities for the next selected index,
   * weighted towards indexes far away from previously selected indexes.
   *
   * Parameters:
   * - n: number, length of the array.
   * - p: number[], array of previously selected indexes.
   * - sigma: number, standard deviation of the Gaussian distribution.
   *
   * Returns:
   * - probabilities: number[], probabilities for each index.
   */
  // Initialize an array to store the minimum distances
  const distances: number[] = Array.from({ length: n }).fill(Infinity) as number[]

  // Calculate the minimum distance to any previously selected index
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (p[j] >= 1) {
        // 1 / abs distance ** 0.5 adds more weight to repeated asignments.
        distances[i] = Math.min(distances[i], 1 / (Math.abs(j - i) ** 0.5))
        // console.log(`Change distance ${i} to ${distances[i]} (abs ${Math.abs(j - i)}) (driect? ${d})`)
        // console.log(i, distances[i])
      }
    }
  }

  // Create a Gaussian distribution based on the distances
  const probabilities: number[] = distances.map(d => Math.exp(-0.5 * ((d === Infinity ? 0 : d) / sigma) ** 2))

  // Normalize the probabilities to sum to 1
  const sum = probabilities.reduce((acc, prob) => acc + prob, 0)
  const normalizedProbabilities = probabilities.map(prob => prob / sum)

  return normalizedProbabilities
}

// WIP - the index next to a `prev` index with a 1 in it is correctly highly likely, but then it starts to fail
// [0, 1, 0, 0, 0, 1] ends with index 4 (should be highest porb) as lower then 3 or 5.
// idea: 'blur' or do a rolling avergae over 3/4 indexes to the `prev` array. then do some
// inversion (1 - p) and scaling to get probabilities.
export function calculateProbabilities(p: number[], s: number): number[] {
  const n = p.length
  const weights = Array.from({ length: n }).map(() => 0)

  for (let i = 0; i < n; i++) {
    let attraction = 0
    for (let j = 0; j < n; j++) {
      if (i !== j && p[j] > 0) {
        const distance = Math.abs(i - j)
        attraction += p[j] / distance ** s
      }
    }
    weights[i] = Math.exp(attraction)
  }

  // Normalize so probabilities sum to 1
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  return weights.map(w => w / totalWeight)
}

// TODO: chasing pairs - below is a generated draw that was shuffled into good lane assignments by rotateAthletes
// [
//   [[6, 7], [3, 1], [2, 5], [4, 8]],
//   [[7, 3], [2, 6], [1, 8], [5, 4]],
//   [[6, 5], [1, 8], [4, 3], [7, 2]],
//   [[5, 1], [3, 6], [8, 2], [4, 7]],
// ]

// Every lane is used 2 times by each athlete, except for 4 and 8 (3, 1) and (1, 3) uses respectively
// by searching for a heat with both of them in it (top right cell), we can swap them to make a perfect lane assignment
// it might be that doing that displaces another athlete, so we follow that to another heat and switch it to compensate
// if we can find some disjoint cycle then we may be able to fix some outliers

// example 2:
// [
//   [[4,1],[3,5],[6,2]],
//   [[4,3],[1,2],[5,6]],
// ]

// here we can swap r1h1 and r2h2 - 4 gets a swap and 2 gets a swap, with 1 acting as an intermediate
// with 2 swaps. maybe we can look for cycles in this way - it gets complicated for higher heat counts

// counterexample

// [
//   [[4,2,3],[5,1]],
//   [[2,1],[3,5,4]],
//   [[2,3,5],[1,4]],
// ]

// 3, 4, and 5 are using each lane once. 1 and 2 never get a chance to use lane 3, so can never be balanced
// even though we find them as a pair that could be swapped. it's not so simple.
