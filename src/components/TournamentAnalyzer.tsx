import { useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import { TournamentDraw } from '../TournamentDraw';
import { DrawResult } from '../types';
// import { Settings, BarChart4, Activity } from 'lucide-react';
import FacingVisualizer from './FacingVisualizer';

export default function TournamentAnalyzer() {
  const [athleteCount, setAthleteCount] = useState(23);
  const [heatSize, setHeatSize] = useState(6);
  const [rounds, setRounds] = useState(5);
  const [iterations, setIterations] = useState(1000);
  const [results, setResults] = useState<DrawResult[]>([]);
  const [bestDraw, setBestDraw] = useState<DrawResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeTournaments = useCallback(() => {
    setIsAnalyzing(true);
    const newResults: DrawResult[] = [];

    setTimeout(() => {
      for (let i = 0; i < iterations; i++) {
        const tournament = new TournamentDraw(athleteCount, heatSize, rounds);
        const draw = tournament.generateTournament();
        const metrics = tournament.getFairnessMetrics();
        newResults.push({ metrics, draw, iteration: i });
      }

      const bestDraw = newResults.reduce((best, current) => {
        if (current.metrics.maxFacings < best.metrics.maxFacings) {
          return current;
        } else if (
          current.metrics.maxFacings === best.metrics.maxFacings &&
          current.metrics.variance < best.metrics.variance
        ) {
          return current;
        }
        return best;
      }, newResults[0]);

      setResults(newResults);
      setBestDraw(bestDraw);
      setIsAnalyzing(false);
    }, 0);
  }, [athleteCount, heatSize, rounds, iterations]);

  const renderPlots = () => {
    if (results.length === 0) return null;

    const data3D: Plotly.Data[] = [
      {
        type: 'scatter3d',
        mode: 'markers',
        x: results.map((r) => r.iteration),
        y: results.map((r) => r.metrics.variance),
        z: results.map((r) => r.metrics.maxFacings),
        marker: {
          size: 3,
          color: results.map((r) => r.metrics.variance),
          colorscale: 'Viridis',
        },
      },
    ];

    const data2D: Plotly.Data[] = [
      {
        type: 'scatter',
        mode: 'markers',
        x: results.map((r) => r.metrics.variance),
        y: results.map((r) => r.metrics.maxFacings),
        marker: {
          size: 5,
          color: results.map((r) => r.metrics.variance),
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex items-center mb-4">
            {/* <Settings className="w-6 h-6 mr-2" /> */}
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

        {bestDraw && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex items-center mb-4">
              {/* <Activity className="w-6 h-6 mr-2" /> */}
              <h2 className="text-xl font-bold">Best Draw Results</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Variance</h3>
                <p className="text-2xl font-semibold">{bestDraw.metrics.variance.toFixed(4)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Max Facings</h3>
                <p className="text-2xl font-semibold">{bestDraw.metrics.maxFacings}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Min Facings</h3>
                <p className="text-2xl font-semibold">{bestDraw.metrics.minFacings}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Facing Visualization</h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <FacingVisualizer athletes={bestDraw.draw[0].flat()} />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Draw Structure</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                {bestDraw.draw.map((round, roundIndex) => (
                  <div key={roundIndex} className="mb-4">
                    <h4 className="font-medium mb-2">Round {roundIndex + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {round.map((heat, heatIndex) => (
                        <div key={heatIndex} className="bg-white p-2 rounded border">
                          <span className="text-sm text-gray-600">Heat {heatIndex + 1}:</span>
                          <div className="text-sm">
                            {heat.map((athlete) => athlete.id).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex items-center mb-4">
              {/* <BarChart4 className="w-6 h-6 mr-2" /> */}
              <h2 className="text-xl font-bold">Visualization</h2>
            </div>
            {renderPlots()}
          </div>
        )}
      </div>
    </div>
  );
}
