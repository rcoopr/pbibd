import { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { TournamentDraw } from '../lib/TournamentDraw';
import { DrawResult } from '../types';
import FacingVisualizer from './FacingVisualizer';
import { Activity, ArrowDownCircle, BarChart4, Settings } from 'lucide-react';

export default function TournamentAnalyzer() {
  const [athleteCount, setAthleteCount] = useState(23);
  const [heatSize, setHeatSize] = useState(6);
  const [rounds, setRounds] = useState(5);
  const [iterations, setIterations] = useState(1000);
  const [draws, setDraws] = useState<DrawResult[]>([]);
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-bold">Tournament Draw Analyzer</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>

          <button
            onClick={analyzeTournaments}
            disabled={isAnalyzing}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Tournaments'}
          </button>
        </div>

        {bestDrawByMaxFacingsCount && (
          <DrawStructure
            draw={bestDrawByMaxFacingsCount}
            title="Best Draw Results by Max Facings Count"
          />
        )}
        {bestDrawByVariance && (
          <DrawStructure draw={bestDrawByVariance} title="Best Draw Results by Variance" />
        )}

        {draws.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex items-center mb-4">
              <BarChart4 className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Visualization</h2>
            </div>
            <Visualization draws={draws} />
          </div>
        )}
      </div>
    </div>
  );
}

function DrawStructure({
  draw,
  title = 'Best Draw Results',
}: {
  draw: DrawResult;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen((o) => !o);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex items-center">
        <Activity className="w-6 h-6 mr-2" />
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="mb-4 opacity-60 text-sm font-semibold">
        (Max/Min Facings) show number of iterations with that count
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Variance</h3>
          <p className="text-2xl font-semibold">{draw.metrics.variance.toFixed(4)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700">Max Facings</h3>
          <p className="text-2xl font-semibold">
            {draw.metrics.maxFacings} ({draw.metrics.maxFacingsCount})
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700">Min Facings</h3>
          <p className="text-2xl font-semibold">
            {draw.metrics.minFacings} ({draw.metrics.minFacingsCount})
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Facing Visualization</h3>
        <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
          <FacingVisualizer athletes={draw.draw[0].flat()} />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Draw Structure</h3>
        <div
          className={`bg-gray-50 p-4 rounded-md relative overflow-hidden ${
            open ? 'h-auto' : 'h-14'
          }`}
        >
          <div className="absolute top-0 right-0 p-4">
            <ArrowDownCircle
              className={`w-6 h-6 text-gray-400 hover:text-gray-500 ${
                open ? 'rotate-180' : 'rotate-0'
              }`}
              onClick={toggleOpen}
            />
          </div>
          {draw.draw.map((round, roundIndex) => (
            <div key={roundIndex} className="mb-4">
              <h4 className="font-semibold text-lg mb-3">Round {roundIndex + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {round.map((heat, heatIndex) => (
                  <div key={heatIndex} className="bg-white p-2 rounded border">
                    <span className="text-sm text-gray-600">Heat {heatIndex + 1}:</span>
                    <div className="text-sm">{heat.map((athlete) => athlete.id).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Visualization({ draws }: { draws: DrawResult[] }) {
  if (draws.length === 0) return null;

  const data3D: Plotly.Data[] = [
    {
      type: 'scatter3d',
      mode: 'markers',
      x: draws.map((r) => r.iteration),
      y: draws.map((r) => r.metrics.variance),
      z: draws.map((r) => r.metrics.maxFacings),
      marker: {
        size: 3,
        color: draws.map((r) => r.metrics.variance),
        colorscale: 'Viridis',
      },
    },
  ];

  const data2D: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: draws.map((r) => r.metrics.variance),
      y: draws.map((r) => r.metrics.maxFacings),
      marker: {
        size: 5,
        color: draws.map((r) => r.metrics.variance),
        colorscale: 'Viridis',
      },
    },
  ];

  const facingsCounts = draws.reduce((counts, draw) => {
    counts[draw.metrics.maxFacings] = (counts[draw.metrics.maxFacings] || 0) + 1;
    return counts;
  }, {} as Record<number, number>);

  const dataBar: Plotly.Data[] = [
    {
      type: 'bar',
      mode: 'markers',
      x: Object.keys(facingsCounts).map((k) => Number(k)),
      y: Object.keys(facingsCounts).map((k) => facingsCounts[Number(k)]),
      marker: {
        size: 5,
        color: Object.keys(facingsCounts).map((k) => Number(k)),
        colorscale: 'Viridis',
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">
          3D Plot: Iteration vs Variance vs Max Facings
        </h3>
        <Plot
          data={data3D}
          layout={{
            margin: { l: 0, r: 0, b: 0, t: 0 },
            scene: {
              xaxis: { title: 'Iteration' },
              yaxis: { title: 'Variance' },
              zaxis: { title: 'Max Facings' },
            },
            autosize: true,
            height: 400,
          }}
          useResizeHandler
          className="w-full"
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">2D Plot: Variance vs Max Facings</h3>
        <Plot
          data={data2D}
          layout={{
            margin: { l: 40, r: 0, b: 40, t: 0 },
            xaxis: { title: 'Variance' },
            yaxis: { title: 'Max Facings' },
            autosize: true,
            height: 400,
          }}
          useResizeHandler
          className="w-full"
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Bar Chart: Max Facings Count</h3>
        <Plot
          data={dataBar}
          layout={{
            margin: { l: 50, r: 0, b: 40, t: 0 },
            xaxis: { title: 'Max Facings Count' },
            yaxis: { title: 'Iteration' },
            autosize: true,
            height: 400,
          }}
          useResizeHandler
          className="w-full"
        />
      </div>
    </div>
  );
}
