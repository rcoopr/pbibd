// export function generateRoundRobinSeeding(
//   athleteCount: number,
//   heatSize: number,
//   roundCount: number,
// ): number[][][] {
//   const heatsCount = Math.ceil(athleteCount / heatSize)
//   const tournament: number[][][] = []

//   for (let round = 0; round < roundCount; round++) {
//     const currentRound: number[][] = Array.from({ length: heatSize })
//       .map(() => Array.from({ length: heatSize }))

//     for (let heat = 0; heat < heatsCount; heat++) {
//       for (let pos = 0; pos < heatSize; pos++) {
//         if (round === 0) {
//           currentRound[heat][pos] = heat * heatSize + pos + 1
//         }
//         else {
//           const prevRoundHeat = (heat + pos) % heatsCount
//           const prevRoundPos = (pos + round) % heatSize
//           currentRound[heat][pos] = tournament[round - 1][prevRoundHeat][prevRoundPos]
//         }
//       }
//     }
//     tournament.push(currentRound)
//   }

//   return tournament
// }

export function generateRoundRobinSeeding(athleteCount: number, heatSize: number, roundCount: number) {
  const heatCount = Math.ceil(athleteCount / heatSize)

  return Array.from({ length: roundCount }).map((_, roundIndex) =>
    Array.from({ length: heatCount }).map((_, heatIndex) =>
      Array.from({ length: heatSize }).map((_, i) =>
        getAthleteHeatPosition(i + heatIndex * heatSize, heatCount, heatSize, roundIndex) + 1,
      ),
    ),
  )
}

function getAthleteHeatPosition(
  athleteIndex: number,
  heatCount: number,
  heatSize: number,
  roundIndex: number,
): number {
  const totalAthletes = heatCount * heatSize

  const newPosition = (roundIndex * (athleteIndex % heatSize) * heatSize + athleteIndex) % totalAthletes

  if (roundIndex === 1 && athleteIndex === 0) {
    console.log('0:', newPosition)
  }
  return newPosition
};
