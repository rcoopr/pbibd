import { Athlete, DrawResult, FairnessMetrics, Root } from '../types';

export class TournamentDraw {
  private athletes: Athlete[];
  private k: number;
  private roundsNeeded: number;

  constructor(n: number, k: number, rounds: number) {
    this.k = k;
    this.roundsNeeded = rounds;
    this.athletes = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      facedCount: new Map(),
    }));

    this.athletes.forEach((athlete) => {
      this.athletes.forEach((other) => {
        if (athlete.id !== other.id) {
          athlete.facedCount.set(other.id, 0);
        }
      });
    });
  }

  private getAssociationScore(athlete: Athlete, heat: Athlete[]): number {
    if (heat.length === 0) return 1;
    let totalFacings = 0;
    heat.forEach((heatAthlete) => {
      totalFacings += athlete.facedCount.get(heatAthlete.id) || 0;
    });
    return 1 / (totalFacings + 1);
  }

  private selectAthleteForHeat(available: Athlete[], currentHeat: Athlete[]): Athlete {
    const weightedAthletes = available.map((athlete) => ({
      athlete,
      weight: this.getAssociationScore(athlete, currentHeat),
    }));

    const totalWeight = weightedAthletes.reduce((sum, wa) => sum + wa.weight, 0);
    let random = Math.random() * totalWeight;

    for (const wa of weightedAthletes) {
      random -= wa.weight;
      if (random <= 0) return wa.athlete;
    }

    return weightedAthletes[0].athlete;
  }

  private calculateHeatSizes(totalAthletes: number): number[] {
    const baseHeatSize = this.k;
    const numFullHeats = Math.floor(totalAthletes / baseHeatSize);
    const remainder = totalAthletes % baseHeatSize;

    if (remainder === 0) {
      return Array(numFullHeats).fill(baseHeatSize);
    }

    const numHeatsNeeded = Math.ceil(totalAthletes / (baseHeatSize + 1));
    const heatSizes: number[] = [];

    let remainingAthletes = totalAthletes;
    for (let i = 0; i < numHeatsNeeded; i++) {
      const remainingHeats = numHeatsNeeded - i;
      const idealSizeForThisHeat = Math.ceil(remainingAthletes / remainingHeats);
      const heatSize = Math.min(baseHeatSize + 1, idealSizeForThisHeat);
      heatSizes.push(heatSize);
      remainingAthletes -= heatSize;
    }

    return heatSizes.sort((a, b) => b - a);
  }

  private generateRound(): Athlete[][] {
    const availableAthletes = [...this.athletes];
    const heats: Athlete[][] = [];
    const heatSizes = this.calculateHeatSizes(this.athletes.length);

    for (const targetSize of heatSizes) {
      const currentHeat: Athlete[] = [];
      while (currentHeat.length < targetSize && availableAthletes.length > 0) {
        const selected = this.selectAthleteForHeat(availableAthletes, currentHeat);
        currentHeat.push(selected);
        availableAthletes.splice(
          availableAthletes.findIndex((a) => a.id === selected.id),
          1
        );
      }
      heats.push(currentHeat);
    }

    return heats;
  }

  private updateFacedCounts(round: Athlete[][]): void {
    round.forEach((heat) => {
      for (let i = 0; i < heat.length; i++) {
        for (let j = i + 1; j < heat.length; j++) {
          const count1 = heat[i].facedCount.get(heat[j].id) || 0;
          const count2 = heat[j].facedCount.get(heat[i].id) || 0;
          heat[i].facedCount.set(heat[j].id, count1 + 1);
          heat[j].facedCount.set(heat[i].id, count2 + 1);
        }
      }
    });
  }

  public generateTournament(): Athlete[][][] {
    const tournament: Athlete[][][] = [];

    for (let r = 0; r < this.roundsNeeded; r++) {
      const round = this.generateRound();
      this.updateFacedCounts(round);
      tournament.push(round);
    }

    return tournament;
  }

  public getFairnessMetrics(): FairnessMetrics {
    return getMetrics(this.athletes, this.k, this.roundsNeeded);
  }
}

export function getMetrics(athletes: Athlete[], heatSize: number, rounds: number): FairnessMetrics {
  const facings: number[] = [];

  athletes.forEach((athlete) => {
    athlete.facedCount.forEach((count) => {
      facings.push(count);
    });
  });

  const v = athletes.length;
  const expectedMeetings = (rounds * heatSize * (heatSize - 1)) / (v * (v - 1));
  const variance =
    facings.reduce((sum, val) => sum + Math.pow(val - expectedMeetings, 2), 0) / facings.length;
  const theoreticalVarianceBound =
    ((rounds * heatSize * (heatSize - 1)) / (v * (v - 1))) * (1 - heatSize / v);

  const maxFacings = Math.max(...facings);
  const minFacings = Math.min(...facings);

  return {
    variance,
    maxFacings,
    minFacings,
    maxFacingsCount: facings.filter((count) => count === maxFacings).length / facings.length,
    minFacingsCount: facings.filter((count) => count === minFacings).length / facings.length,
    theoreticalVarianceBound,
  };
}

export function analyzeLiveheatsDraw(heats: Root['heats']): DrawResult {
  const athletes: Athlete[] = Array.from(
    new Set(heats.map((heat) => heat.competitors.map((c) => c.athleteId)).flat())
  ).map((id) => ({ id: Number(id), facedCount: new Map() }));
  athletes.forEach((athlete) => {
    athletes.forEach((other) => {
      if (athlete.id !== other.id) {
        athlete.facedCount.set(other.id, 0);
      }
    });
  });

  const roundHash = heats.reduce((acc, heat) => {
    if (acc[heat.group.roundName]) {
      acc[heat.group.roundName].push(heat.competitors);
    } else {
      acc[heat.group.roundName] = [heat.competitors];
    }
    return acc;
  }, {} as Record<string, Root['heats'][number]['competitors'][]>);

  const rounds: Athlete[][][] = Object.entries(roundHash)
    .filter(([key]) => key.startsWith('Round'))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, heats]) =>
      heats.map((heat) => heat.map((c) => athletes.find((a) => a.id === Number(c.athleteId))!))
    );

  const tournament: Athlete[][][] = [];
  for (const round of rounds) {
    round.forEach((heat) => {
      for (let i = 0; i < heat.length; i++) {
        for (let j = i + 1; j < heat.length; j++) {
          const count1 = heat[i].facedCount.get(heat[j].id) || 0;
          const count2 = heat[j].facedCount.get(heat[i].id) || 0;
          heat[i].facedCount.set(heat[j].id, count1 + 1);
          heat[j].facedCount.set(heat[i].id, count2 + 1);
        }
      }
    });
    tournament.push(round);
  }

  return {
    metrics: getMetrics(
      athletes,
      Math.round(heats.reduce((acc, heat) => acc + heat.config.heatSize, 0) / heats.length),
      rounds.length
    ),
    draw: tournament,
    iteration: 1,
  };
}
