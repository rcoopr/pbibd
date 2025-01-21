import { useState } from 'react';
import { Athlete } from '../types';

interface Props {
  athletes: Athlete[];
  maxFacings: number;
}

export default function FacingVisualizer({ athletes, maxFacings }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number>(0);
  const [hoveredAthlete, setHoveredAthlete] = useState<number | null>(null);
  const [hoveredFacings, setHoveredFacings] = useState<[number, number][]>([]);
  // console.log({hoveredFacings, hoveredAthlete})
  const spacing = 40;
  const radius = 12;
  const height = 200;
  const midpoint = athletes.length / 2;
  // const width = Math.ceil(midpoint) * spacing;
  const width = athletes.length * spacing;
  
  const getFacings = (athleteId: number) => {
    const athlete = athletes.find((a) => a.id === athleteId);
    return athlete ? Array.from(athlete.facedCount.entries()).sort((a, b) => a[0] - b[0]) : [];
  };
  const handleHover = (athleteId: number | null, index: number) => {
    setHoveredAthlete(athleteId);
    if (athleteId !== null) {
      setHoveredIndex(index);
      setHoveredFacings(getFacings(athleteId));
    }
  };
  
  const sortedAthletes = athletes.sort((a, b) => a.id - b.id);
  
  return (
    <svg width={width} height={height} className="max-w-full">
      {/* Top row of numbers */}
      {sortedAthletes.slice(0, Math.ceil(midpoint)).map((athlete, i) => {
        const facingCount =
        i === hoveredIndex ? '' : hoveredFacings[i < hoveredIndex ? i : i - 1]?.[1];       

        return (
          <g
            key={`top-${athlete.id}`}
            onMouseEnter={() => handleHover(athlete.id, i)}
            onMouseLeave={() => handleHover(null, i)}
          >
            <circle
              cx={i * spacing + spacing / 2}
              cy={radius * 2}
              r={radius}
              className="fill-gray-100 stroke-gray-400"
              onMouseEnter={() => setHoveredAthlete(athlete.id)}
              onMouseLeave={() => setHoveredAthlete(null)}
            />
            <text
              x={i * spacing + spacing / 2}
              y={radius * 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-medium select-none pointer-events-none"
            >
              {athlete.id}
            </text>
            <text
              x={i * spacing + spacing / 2}
              y={radius * 2 - 18}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-sm font-medium select-none pointer-events-none transition-opacity duration-300 ${
                hoveredAthlete !== null ? 'opacity-60' : 'opacity-0'
              }`}
            >
              {facingCount || ''}
            </text>
          </g>
        );
      })}

      {/* Bottom row of numbers */}
      {sortedAthletes.slice(Math.ceil(midpoint)).map((athlete, i) => {
        // adjust half a space where midpoint is e.g. 13.5
        const adj = Math.ceil(midpoint) - midpoint;
        const adjustedI = i + Math.ceil(midpoint);
        const facingCount =
          adjustedI === hoveredIndex
            ? ''
            : hoveredFacings[adjustedI < hoveredIndex ? adjustedI : adjustedI - 1]?.[1];

        return (
          <g
            key={`bottom-${athlete.id}`}
            onMouseEnter={() => handleHover(athlete.id, adjustedI)}
            onMouseLeave={() => handleHover(null, adjustedI)}
          >
            <circle
              cx={(i + adj) * spacing + spacing / 2}
              cy={height - radius * 2}
              r={radius}
              className="fill-gray-100 stroke-gray-400"
              onMouseEnter={() => setHoveredAthlete(athlete.id)}
              onMouseLeave={() => setHoveredAthlete(null)}
            />
            <text
              x={(i + adj) * spacing + spacing / 2}
              y={height - radius * 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-medium select-none pointer-events-none"
            >
              {athlete.id}
            </text>
            <text
              x={(i + adj) * spacing + spacing / 2}
              y={height - radius * 2 + 20}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-sm font-medium select-none pointer-events-none transition-opacity duration-300 ${
                hoveredAthlete !== null ? 'opacity-60' : 'opacity-0'
              }`}
            >
              {facingCount || ''}
            </text>
          </g>
        );
      })}

      {/* Connection lines */}
      {sortedAthletes.map((athlete, i) => {
        const facings = getFacings(athlete.id);
        // const totalFacings = facings.reduce((sum, facing) => sum + facing[1], 0);

        return facings.map(([otherId, count]) => {
          if (otherId < athlete.id) return null; // Only draw lines once
          const j = sortedAthletes.findIndex((a) => a.id === otherId);
          const isHighlighted = hoveredAthlete === athlete.id || hoveredAthlete === otherId;
          const color =
            count === 0
              ? 'text-red-700'
              : colorMap[Math.min(maxFacings - count, colorMap.length - 1)];

          if (count === 0) return null;

          if (i < midpoint && j < midpoint) {
            // little loop to same-side number line (top half)
            const heightModifier = 1 / Math.abs(i - j);
            const bezierHeight = (Math.max(1 - heightModifier ** 0.35, 0.14) * height) / 2;
            const h = radius * 3;

            return (
              <path
                strokeDasharray={count === 0 ? '5 5' : ''}
                key={`${athlete.id}-${otherId}`}
                d={`M ${i * spacing + spacing / 2} ${h} 
                C ${i * spacing + spacing / 2} ${h + bezierHeight},
                  ${j * spacing + spacing / 2} ${h + bezierHeight},
                  ${j * spacing + spacing / 2} ${h}`}
                className={`stroke-current fill-none transition-opacity duration-300 ${color}`}
                opacity={isHighlighted ? 1 : hoveredAthlete !== null ? 0.05 : count * 0.1}
                strokeWidth={1}
              />
            );
          }

          if (i >= midpoint && j >= midpoint) {
            // little loop to same-side number line (bottom half)
            const heightModifier = 1 / Math.abs(i - j);
            const bezierHeight = (Math.max(1 - heightModifier ** 0.35, 0.14) * height) / 2;
            const h = height - radius * 3;
            const iSpace = (i - midpoint) * spacing + spacing / 2;
            const jSpace = (j - midpoint) * spacing + spacing / 2;

            return (
              <path
                strokeDasharray={count === 0 ? '5 5' : ''}
                key={`${athlete.id}-${otherId}`}
                d={`M ${iSpace} ${h} 
                C ${iSpace} ${h - bezierHeight},
                  ${jSpace} ${h - bezierHeight},
                  ${jSpace} ${h}`}
                className={`stroke-current fill-none transition-opacity duration-300 ${color}`}
                opacity={isHighlighted ? 1 : hoveredAthlete ? 0.05 : count * 0.1}
                strokeWidth={1}
              />
            );
          }

          if (i < midpoint && j >= midpoint) {
            const jSpace = (j - midpoint) * spacing + spacing / 2;
            return (
              <path
                strokeDasharray={count === 0 ? '5 5' : ''}
                key={`${athlete.id}-${otherId}`}
                d={`M ${i * spacing + spacing / 2} ${radius * 3}
                  C ${i * spacing + spacing / 2} ${height / 2},
                    ${jSpace} ${height / 2},
                    ${jSpace} ${height - radius * 3}`}
                className={`stroke-current fill-none transition-opacity duration-300 ${color}`}
                opacity={isHighlighted ? 1 : hoveredAthlete !== null ? 0.05 : count * 0.1}
                strokeWidth={1}
              />
            );
          }

          return null;
        });
      })}
    </svg>
  );
}
const colorMap = ['text-pink-600', 'text-indigo-600', 'text-cyan-600', 'text-emerald-600'];
