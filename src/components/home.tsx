// import { SavedAnalysis } from '@/components/analysis/saved-analysis'
import { SummaryTable } from '@/components/analysis/summary-table'
import { LazyReact, LazyReactNaiveRetry } from '@/components/lazy-react'
// import { LazyReact } from '@/components/lazy-react'
import { lazy, Suspense, useState } from 'react'

const SavedAnalysisTest = LazyReact(() => import('../components/analysis/saved-analysis'))

export function Home() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>('frankenstein')

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 breakout-container breakout-container-[80ch] justify-items-center items-start p-8 relative">
        <h1 className="font-bold text-xl p-6">Round Robin Draw Analysis</h1>
        <div className="text-left max-w-[80ch] mx-auto text-gray-500 text-sm">
          <ul className="ml-8 list-decimal space-y-2">
            <li>
              <b>MX</b>
              {' '}
              is short for
              {' '}
              <b>Matchups</b>
              .
            </li>
            <li>
              Summary statistics are sorted by
              {' '}
              <b>
                σ
                <sup>2</sup>
                <sub>DIFF</sub>
              </b>
              . This is a measure of how evenly the draws are distributed compared to an ideal (sometimes impossible) draw.
            </li>
            <li>
              <b>{'Missing MX % '}</b>
              {' '}
              is the average % of missed matchups that theoretically could have been generated. It measures how often an athlete might complain about never matching up against some other athlete
            </li>
            <li>
              <b>Count</b>
              {' '}
              is the total number of draws that are less evenly distributed than an ideal draw.
              <b>{' Optimal'}</b>
              {' '}
              is the number of draws that are evenly distributed.
            </li>
            <li>
              <b>{'Analysing a specific draw '}</b>
              can be done by clicking on the row in the draw table. Below will be a draw table filterable by athlete count, heat count and round count. Click on a row to expand and view the real draw and a matchup table. Look to the
              <b>{' matchup table '}</b>
              and
              <b>{' distribution plot '}</b>
              for insight into the balance of a draw.
            </li>
          </ul>
        </div>

        <section className="breakout-full my-8">
          <h2 className="p-2 font-semibold italic text-gray-600">Algorithm summary statistics</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <SummaryTable onRowSelect={setSelectedAlgorithm} selectedRow={selectedAlgorithm} />
          </div>
        </section>

        <Suspense fallback={<div>Loading...</div>}>
          <SavedAnalysisTest algorithm={selectedAlgorithm} />
        </Suspense>
      </div>
    </>
  )
}
