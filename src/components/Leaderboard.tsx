import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { EventWithResults } from '../types'

interface Props {
  events: EventWithResults[]
}

type ShooterStats = {
  namn: string
  sessions: number
  bestScore: number
  avgScore: number
  bestInnerTens: number | null
  avgInnerTens: number | null
  latestDate: string
  totalResults: number
}

type ShooterResult = {
  event_date: string
  total_score: number
  inner_tens: number | null
  event_type: string
  event_title: string
}

export function Leaderboard({ events }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  const allResults = events.flatMap((e) =>
    e.results.map((r) => ({ ...r, event_date: e.event_date, event_type: e.type, event_title: e.title }))
  )

  const byShooter = new Map<string, typeof allResults>()
  for (const r of allResults) {
    const name = r.shooter_name ?? '(okänd)'
    if (!byShooter.has(name)) byShooter.set(name, [])
    byShooter.get(name)!.push(r)
  }

  const stats: ShooterStats[] = [...byShooter.entries()].map(([namn, results]) => {
    const scores = results.map((r) => r.total_score)
    const tens = results.map((r) => r.inner_tens).filter((t): t is number => t != null)
    return {
      namn,
      sessions: results.length,
      totalResults: results.length,
      bestScore: Math.max(...scores),
      avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      bestInnerTens: tens.length > 0 ? Math.max(...tens) : null,
      avgInnerTens: tens.length > 0 ? Math.round((tens.reduce((a, b) => a + b, 0) / tens.length) * 10) / 10 : null,
      latestDate: results.map((r) => r.event_date).sort().at(-1) ?? '',
    }
  })

  stats.sort((a, b) =>
    b.bestScore - a.bestScore ||
    (b.bestInnerTens ?? -1) - (a.bestInnerTens ?? -1) ||
    b.avgScore - a.avgScore
  )

  const totalAll = allResults.length

  if (stats.length === 0) {
    return <p className="muted">Inga resultat registrerade ännu.</p>
  }

  const best = stats[0].bestScore

  const bestAvg = [...stats].sort((a, b) => b.avgScore - a.avgScore)[0]
  const bestTior = [...stats].filter((s) => s.bestInnerTens != null).sort((a, b) => (b.bestInnerTens ?? 0) - (a.bestInnerTens ?? 0))[0]

  const podiums = [
    { label: 'Bästa poäng', name: stats[0].namn, value: stats[0].bestScore, unit: 'poäng' },
    { label: 'Bästa snitt', name: bestAvg.namn, value: bestAvg.avgScore, unit: 'snitt' },
    ...(bestTior ? [{ label: 'Flest tior', name: bestTior.namn, value: bestTior.bestInnerTens!, unit: 'tior' }] : []),
  ]

  const selectedResults: ShooterResult[] = selected
    ? (byShooter.get(selected) ?? []).slice().sort((a, b) => a.event_date.localeCompare(b.event_date))
    : []

  const chartData = selectedResults.map((r, i) => ({
    nr: i + 1,
    datum: r.event_date,
    poäng: r.total_score,
    tior: r.inner_tens,
  }))

  const last10 = [...selectedResults].reverse().slice(0, 10)

  return (
    <div className="leaderboard">
      <div className="podium-row">
        {podiums.map((p) => (
          <div key={p.label} className="podium-card podium-gold">
            <div className="podium-medal">🥇</div>
            <div className="podium-category">{p.label}</div>
            <div className="podium-name">{p.name}</div>
            <div className="podium-score">{p.value}</div>
            <div className="podium-label">{p.unit}</div>
          </div>
        ))}
      </div>

      <div className="leaderboard-table-wrap">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Namn</th>
              <th title="Bästa registrerade totalpoäng">Bästa</th>
              <th title="Genomsnittspoäng">Snitt</th>
              <th title="Antal registrerade resultat">Pass</th>
              <th title="Bästa antal inner tior">Tior</th>
              <th title="Senaste aktivitet">Senast</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={s.namn} className={`${i < 3 ? 'top-three' : ''} ${selected === s.namn ? 'row-selected' : ''}`}>
                <td className="rank-cell">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                <td className="name-cell">
                  <button
                    className="name-link"
                    onClick={() => setSelected(selected === s.namn ? null : s.namn)}
                  >
                    {s.namn}
                  </button>
                </td>
                <td>
                  <span className="score-bar-wrap">
                    <span className="score-bar" style={{ width: `${Math.round((s.bestScore / best) * 100)}%` }} />
                    <span className="score-val">{s.bestScore}</span>
                  </span>
                </td>
                <td>{s.avgScore}</td>
                <td>{s.sessions}</td>
                <td>{s.bestInnerTens ?? '–'}</td>
                <td className="muted">{s.latestDate}</td>
              </tr>
            ))}
            <tr className="totalt-row">
              <td colSpan={4}><strong>Totalt</strong></td>
              <td><strong>{totalAll}</strong></td>
              <td colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
        <div className="shooter-detail" onClick={(e) => e.stopPropagation()}>
          <div className="shooter-detail-header">
            <h3>{selected}</h3>
            <button className="close-btn" onClick={() => setSelected(null)}>✕</button>
          </div>

          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="datum" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} width={36} />
                <Tooltip labelFormatter={(l) => `Datum: ${l}`} />
                <Line type="monotone" dataKey="poäng" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="muted">Minst 2 resultat krävs för att visa diagram.</p>
          )}

          <h4 style={{ margin: '1rem 0 0.5rem' }}>Senaste 10 skjutningarna</h4>
          <div className="leaderboard-table-wrap">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Pass</th>
                  <th>Poäng</th>
                  <th>Tior</th>
                </tr>
              </thead>
              <tbody>
                {last10.map((r, i) => (
                  <tr key={i}>
                    <td>{r.event_date}</td>
                    <td>{r.event_title}</td>
                    <td><strong>{r.total_score}</strong></td>
                    <td>{r.inner_tens ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}
    </div>
  )
}
