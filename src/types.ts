export interface Athlete {
  id: number
  facedCount: Map<number, number>
}

export interface FairnessMetrics {
  variance: number
  maxFacings: number
  minFacings: number
  maxFacingsCount: number
  minFacingsCount: number
  theoreticalVarianceBound: number
}

export interface DrawResult {
  metrics: FairnessMetrics
  draw: Athlete[][][]
  iteration: number
}

export interface Root {
  heats: Heat[]
}

export interface Heat {
  id: string
  contestId: string
  eventDivisionId: string
  round: string
  roundPosition: number
  position: number
  startTime: unknown
  endTime: unknown
  heatDurationMinutes: number
  scheduledTime: unknown
  config: Config
  result: Result[]
  competitors: Competitor[]
  group: Group
  eventDivision: EventDivision
  progressions: Progression[]
  __typename: string
}

export interface Config {
  jerseyOrder: unknown[]
  runBased: unknown
  hideTimer: boolean
  hideNeeds: boolean
  hideScheduledTime: boolean
  hideScores: boolean
  maxRideScore: number
  categories: unknown
  isTeams: boolean
  hasStartlist: boolean
  usesLanes: boolean
  numberOfLanes: unknown
  hasLeaderboard: unknown
  hasPriority: unknown
  calculator: string
  heatSize: number
  totalCountingRides: number
  teamConfig: TeamConfig
  __typename: string
}

export interface TeamConfig {
  athletesPerTeam: number
  appraisalLevel: string
  __typename: string
}

export interface Result {
  athleteId: string
  total: number
  winBy: unknown
  needs: unknown
  rides: Rides
  place: unknown
  __typename: string
}

export type Rides = Record<string, unknown[]>

export interface Competitor {
  id: string
  athleteId: string
  position: number
  priority: unknown
  teamName: unknown
  bib: unknown
  athlete: LHAthlete
  teamMembers: unknown[]
  __typename: string
}

export interface LHAthlete {
  id: string
  name: string
  image?: string | null
  __typename: string
}

export interface Group {
  name: string
  roundName: string
  roundContestId: string
  groupContestId: string
  __typename: string
}

export interface EventDivision {
  id: string
  division: Division
  __typename: string
}

export interface Division {
  id: string
  name: string
  __typename: string
}

export interface Progression {
  round: string
  roundPosition: number
  heat: number
  position: number
  roundOnly?: boolean | null
  run: unknown
  obscure: boolean
  __typename: string
}
