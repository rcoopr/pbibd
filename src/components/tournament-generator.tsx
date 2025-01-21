import { useState, useCallback } from 'react';
import { TournamentDraw } from '../lib/TournamentDraw';
import { DrawResult } from '../types';
import { Settings } from 'lucide-react';
import TournamentAnalyzer from './tournament-analyzer';

export default function TournamentGenerator() {
  const [athleteCount, setAthleteCount] = useState(23);
  const [heatSize, setHeatSize] = useState(6);
  const [rounds, setRounds] = useState(5);
  const [iterations, setIterations] = useState(1000);
  const [draws, setDraws] = useState<DrawResult[]>([]);
  // const [allowZeroMinFacings, setAllowZeroMinFacings] = useState(true);
  const [bestDrawByVariance, setBestDrawByVariance] = useState<DrawResult | null>(null);
  const [bestDrawByMaxFacingsCount, setBestDrawByMaxFacingsCount] = useState<DrawResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTournaments = useCallback(() => {
    setIsAnalyzing(true);
    const newDraws: DrawResult[] = [];

    setTimeout(() => {
      for (let i = 0; i < iterations; i++) {
        const tournament = new TournamentDraw(athleteCount, heatSize, rounds);
        const draw = tournament.generateTournament();
        const metrics = tournament.getFairnessMetrics();
        newDraws.push({ metrics, draw, iteration: i });
      }

      const [bestDrawByVariance, bestDrawByMaxFacingsCount] = newDraws.reduce(
        (best, current) => {
          // if (!allowZeroMinFacings && current.metrics.minFacings === 0) {
          //   // discount draws with no athletes facing
          //   return best;
          // }
          if (current.metrics.maxFacings < best[0].metrics.maxFacings) {
            best[0] = current;
          } else if (
            current.metrics.maxFacings === best[0].metrics.maxFacings &&
            current.metrics.variance < best[0].metrics.variance
          ) {
            best[0] = current;
          }

          if (current.metrics.maxFacings < best[1].metrics.maxFacings) {
            best[1] = current;
          } else if (
            current.metrics.maxFacings === best[1].metrics.maxFacings &&
            current.metrics.maxFacingsCount < best[1].metrics.maxFacingsCount
          ) {
            best[1] = current;
          }

          return best;
        },
        [newDraws[0], newDraws[0]]
      );

      setDraws(newDraws);
      setBestDrawByVariance(bestDrawByVariance);
      setBestDrawByMaxFacingsCount(bestDrawByMaxFacingsCount);
      setIsAnalyzing(false);
    }, 0);
  }, [athleteCount, heatSize, rounds, iterations]);

  return (
    <>
      <div className="bg-white rounded-lg min-w-fit shadow p-6 mb-4">
        <div className="flex items-center mb-4">
          <Settings className="w-6 h-6 mr-2" />
          <h2 className="text-xl font-bold">Tournament Draw Generator</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Athletes</label>
            <input
              type="number"
              value={athleteCount}
              onChange={(e) => setAthleteCount(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Heat Size</label>
            <input
              type="number"
              value={heatSize}
              onChange={(e) => setHeatSize(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rounds</label>
            <input
              type="number"
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Iterations</label>
            <input
              type="number"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="1"
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700">0 Min Facings?</label>
            <input
              type="checkbox"
              checked={allowZeroMinFacings}
              onChange={(e) => setAllowZeroMinFacings(!!e.target.checked)}
              style={{ zoom: 1.5 }}
              className="mt-1 cursor-pointer block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div> */}
        </div>

        <button
          onClick={analyzeTournaments}
          disabled={isAnalyzing}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Tournaments'}
        </button>
      </div>
      <TournamentAnalyzer
        bestDrawByMaxFacingsCount={bestDrawByMaxFacingsCount}
        bestDrawByVariance={bestDrawByVariance}
        draws={draws}
      />
    </>
  );
}
