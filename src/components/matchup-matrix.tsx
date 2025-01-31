export function MatchupMatrix({ data }: { data: number[] }) {
  const athleteCount = (1 + (1 + 8 * data.length) ** 0.5) / 2
  const cells = Array.from({ length: athleteCount })

  let index = 0

  return (
    <div className="flex gap-4 items-center">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${athleteCount}, 3ch)`,
          gridTemplateRows: `repeat(${athleteCount}, 3ch)`,
        }}
      >

        {cells.map((_, i) => i === 0
          ? null
          : (
              <div key={`top-${i}`} className="flex items-center justify-center row-start-1 opacity-60" style={{ gridColumn: i + 1 }}>
                {i + 1}
              </div>
            ))}

        {cells.map((_, i) => i === 0
          ? null
          : (
              <div key={`top-${i}`} className="flex items-center justify-center col-start-1 opacity-60" style={{ gridRow: i + 1 }}>
                {i}
              </div>
            ))}

        {/* counts */}
        {cells.map((_, i) => cells.map((_, j) => {
          const used = j >= i + 1
          if (!used)
            return null

          const count = data[index++]

          return (
            <div
              key={`${i}-${j}`}
              className="flex items-center justify-center border-b border-r border-l -mr-px border-zinc-200 bg-blue-400"
              style={{
                '--tw-bg-opacity': count * 0.125,
                gridColumn: j + 1,
                gridRow: i + 2,
              }}
            >
              {count}
            </div>
          )
        }))}

        <div style={{ gridArea: '2 / 1 / -1 / -1' }} className="border-t border-zinc-400" />
        <div style={{ gridArea: '1 / 2 / -1 / -1' }} className="border-l border-zinc-400" />
      </div>

      
    </div>
  )
}
