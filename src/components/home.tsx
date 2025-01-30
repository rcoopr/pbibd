import { SavedAnalysis } from '@/components/analysis/saved-analysis'
import { SummaryTable } from '@/components/summary/summary-table'
import { useState } from 'react'

export function Home() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null)

  return (
    <div className="w-screen min-h-screen bg-gray-50 flex flex-col items-center p-8 gap-16">
      <h1 className="font-bold text-xl">Round Robin Draw Analysis</h1>

      <section className="bg-white rounded-lg shadow-lg overflow-hidden">
        <SummaryTable onRowSelect={setSelectedAlgorithm} selectedRow={selectedAlgorithm} />
      </section>

      {/* <section className="bg-white rounded-lg shadow-lg overflow-hidden">
        <AnalysisTable />
      </section> */}

      {selectedAlgorithm !== null && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <SavedAnalysis algorithm={selectedAlgorithm} />
        </div>
      )}
    </div>
  )
}
