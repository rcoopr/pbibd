export interface Athlete {
  id: number;
  facedCount: Map<number, number>;
}

export interface FairnessMetrics {
  variance: number;
  maxFacings: number;
  minFacings: number;
  theoreticalVarianceBound: number;
}

export interface DrawResult {
  metrics: FairnessMetrics;
  draw: Athlete[][][];
  iteration: number;
}