import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { EventWithResults } from '../types'

interface Props {
  events: EventWithResults[]
}

const DOT_COLOR = { traning: '#2563eb', tavling: '#b45309' } as const

function ScoreDot({ cx, cy, payload }: { cx?: number; cy?: number; payload?: { type: keyof typeof DOT_COLOR } }) {
  if (cx == null || cy == null || !payload) return null
  return <circle cx={cx} cy={cy} r={4} fill={DOT_COLOR[payload.type]} stroke={DOT_COLOR[payload.type]} />
}

export function ProgressChart({ events }: Props) {
  const points = events
    .flatMap((event) =>
      event.results.map((result) => ({
        date: event.event_date,
        title: event.title,
        type: event.type,
        score: result.total_score,
      }))
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  if (points.length === 0) {
    return <p className="muted">Inga resultat registrerade ännu.</p>
  }

  return (
    <div className="card">
      <h2>Utveckling över tid</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value) => [value, 'Poäng']}
            labelFormatter={(label, payload) => {
              const p = payload?.[0]?.payload
              return p ? `${label} — ${p.title}` : label
            }}
          />
          <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={<ScoreDot />} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
