import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { EventWithResults } from '../types'

interface Props {
  events: EventWithResults[]
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
          <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
