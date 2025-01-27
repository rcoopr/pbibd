export type Division = Round[]
export type Round = Heat[]
export type Heat = number[]

export type AnalyzedDraw = AnalyzedRound[]
export type AnalyzedRound = AnalyzedHeat[]

export type AnalyzedHeat = { id: ID, matchupCount: Map<ID, AthleteEncounter[]> }[]
export type ID = string | number
export interface AthleteEncounter {
  athleteId: number
  round: number
}

export type DrawGenerator = (athleteCount: number, heatSize: number, roundCount: number) => Division
export type AnalyzedDrawGenerator<Opts extends Record<string, unknown> = Record<string, never>> = (
  athleteCount: number,
  heatSize: number,
  roundCount: number,
  opts: Opts
) => AnalyzedDraw
