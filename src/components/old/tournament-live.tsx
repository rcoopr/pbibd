import Settings from 'lucide-react/icons/settings'
import { useCallback, useState } from 'react'
import { analyzeLiveheatsDraw } from './analyze'
import { defaultData, getEventDivisionQuery } from './query'
import TournamentAnalyzer from './tournament-analyzer'

export default function TournamentLive() {
  const [eventDivision, setEventDivision] = useState('87871')
  // const [data, setData] = useState(defaultData)
  const [analysis, setAnalysis] = useState(() => analyzeLiveheatsDraw(defaultData))
  const [isLoading, setIsLoading] = useState(false)

  const analyzeTournament = useCallback(async () => {
    setIsLoading(true)

    const variables = {
      id: eventDivision,
    }

    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_AUTH_TOKEN',
      },
      body: JSON.stringify({
        query: getEventDivisionQuery,
        variables,
        operationName: 'getEventDivision',
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data) {
        // setData(data.data.eventDivision.heats)
        setAnalysis(analyzeLiveheatsDraw(data.data.eventDivision.heats))
      }

      // console.log({ heats: data.data.eventDivision.heats })
    }

    setIsLoading(false)
  }, [eventDivision])

  return (
    <>
      <div className="bg-white rounded-lg min-w-fit shadow-sm p-6 mb-4">
        <div className="flex items-center mb-4">
          <Settings className="w-6 h-6 mr-2" />
          <h2 className="text-xl font-bold">Tournament Draw Analyzer</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Division</label>
            <input
              type="number"
              value={eventDivision}
              onChange={e => setEventDivision(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-xs focus:border-indigo-300 focus:ring-3 focus:ring-indigo-200 focus:ring-opacity-50"
              min="1"
            />
          </div>
        </div>

        <button
          onClick={analyzeTournament}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Analyze Tournaments'}
        </button>
      </div>
      <TournamentAnalyzer
        bestDrawByMaxFacingsCount={analysis}
        bestDrawByVariance={null}
        draws={[analysis]}
      />
    </>
  )
}
