import { SavedAnalysis } from '@/components/analysis/saved-analysis'
import { SummaryTable } from '@/components/analysis/summary-table'
import { useState } from 'react'

export function Home() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>('frankenstein')

  return (
    <div className="w-screen min-h-screen bg-gray-50 flex flex-col items-center p-8 relative">
      <h1 className="font-bold text-xl mb-6">Round Robin Draw Analysis</h1>

      <section className="bg-white rounded-lg shadow-lg overflow-hidden">
        <SummaryTable onRowSelect={setSelectedAlgorithm} selectedRow={selectedAlgorithm} />
      </section>
      <p className="mt-4 text-center max-w-[80ch] text-gray-500 text-sm"><b>Missing Matchups %</b> is the percentage of pairs of athletes that never meet across all generated rounds. It is misleading as the current algorithm generates, on average, more overall pairs than the other algorithms</p>

      {/* <section className="bg-white rounded-lg shadow-lg overflow-hidden">
        <AnalysisTable />
      </section> */}

      <SavedAnalysis algorithm={selectedAlgorithm} />
    </div>
  )
}
