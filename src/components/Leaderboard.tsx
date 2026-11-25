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
  totalScore: number
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
      totalScore: scores.reduce((a, b) => a + b, 0),
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

  // EWA alpha: recent sessions weigh more, older fade gradually
  const ALPHA = 0.3

  function addTrends(data: { poäng: number; tior: number | null }[]) {
    // EWA
    let ewaP = data[0]?.poäng ?? 0
    let ewaT = data[0]?.tior ?? 0
    // Linear regression
    const n = data.length
    const xs = data.map((_, i) => i)
    const sumX = xs.reduce((a, b) => a + b, 0)
    const sumX2 = xs.reduce((a, b) => a + b * b, 0)
    const sumYp = data.reduce((a, b) => a + b.poäng, 0)
    const sumYt = data.reduce((a, b) => a + (b.tior ?? 0), 0)
    const slopeP = (n * data.reduce((a, b, i) => a + i * b.poäng, 0) - sumX * sumYp) / (n * sumX2 - sumX * sumX)
    const slopeT = (n * data.reduce((a, b, i) => a + i * (b.tior ?? 0), 0) - sumX * sumYt) / (n * sumX2 - sumX * sumX)
    const intP = (sumYp - slopeP * sumX) / n
    const intT = (sumYt - slopeT * sumX) / n

    return data.map((r, i) => {
      if (i > 0) {
        ewaP = ALPHA * r.poäng + (1 - ALPHA) * ewaP
        ewaT = ALPHA * (r.tior ?? ewaT) + (1 - ALPHA) * ewaT
      }
      return {
        ...r,
        ewaP: Math.round(ewaP * 10) / 10,
        ewaT: Math.round(ewaT * 10) / 10,
        trendP: Math.round((intP + slopeP * i) * 10) / 10,
        trendT: Math.round((intT + slopeT * i) * 10) / 10,
      }
    })
  }

  const chartData = addTrends(
    selectedResults.map((r, i) => ({ nr: i + 1, datum: r.event_date, poäng: r.total_score, tior: r.inner_tens }))
  )

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
              <th title="Summa av alla registrerade poäng">Totalt</th>
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
                <td>{s.totalScore}</td>
                <td>{s.sessions}</td>
                <td>{s.bestInnerTens ?? '–'}</td>
                <td className="muted">{s.latestDate}</td>
              </tr>
            ))}
            <tr className="totalt-row">
              <td colSpan={4}><strong>Totalt</strong></td>
              <td><strong>{stats.reduce((a, s) => a + s.totalScore, 0)}</strong></td>
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

          {chartData.length >= 2 && (() => {
            const first = chartData[0], last = chartData[chartData.length - 1]
            const slopeP = last.trendP - first.trendP
            const slopeT = last.trendT - first.trendT
            const arrow = (s: number) => s > 0.3 ? '↑' : s < -0.3 ? '↓' : '→'
            const color = (s: number) => s > 0.3 ? '#16a34a' : s < -0.3 ? '#dc2626' : '#6b7280'
            const label = (s: number) => s > 0.3 ? 'Positiv trend' : s < -0.3 ? 'Negativ trend' : 'Stabil'
            return (
              <div style={{ display: 'flex', gap: '1.5rem', margin: '0 0 1rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'block' }}>Poängtrend</span>
                  <span style={{ fontSize: '1.6rem', color: color(slopeP), lineHeight: 1 }}>{arrow(slopeP)}</span>
                  <span style={{ fontSize: '0.72rem', color: color(slopeP) }}>{label(slopeP)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'block' }}>Tiortrend</span>
                  <span style={{ fontSize: '1.6rem', color: color(slopeT), lineHeight: 1 }}>{arrow(slopeT)}</span>
                  <span style={{ fontSize: '0.72rem', color: color(slopeT) }}>{label(slopeT)}</span>
                </div>
              </div>
            )
          })()}

          {chartData.length >= 2 ? (
            <>
              <p style={{ margin: '0 0 0.25rem', fontWeight: 600, fontSize: '0.85rem', color: '#3b82f6' }}>Poäng</p>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.4rem' }}>
                <span style={{ color: '#93c5fd' }}>···</span> Rådata &nbsp;
                <span style={{ color: '#3b82f6' }}>—</span> EWA (trend) &nbsp;
                <span style={{ color: '#1d4ed8' }}>— —</span> Linjär trend
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="datum" tick={{ fontSize: 10 }} />
                  <YAxis domain={[150, 'auto']} tick={{ fontSize: 10 }} width={36} />
                  <Tooltip labelFormatter={(l) => `Datum: ${l}`} />
                  <Line type="monotone" dataKey="poäng" stroke="#93c5fd" strokeWidth={1} strokeDasharray="3 3" dot={{ r: 3 }} activeDot={{ r: 5 }} name="Rådata" />
                  <Line type="monotone" dataKey="ewaP" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="EWA" />
                  <Line type="monotone" dataKey="trendP" stroke="#1d4ed8" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Trend" />
                </LineChart>
              </ResponsiveContainer>

              <p style={{ margin: '1.25rem 0 0.25rem', fontWeight: 600, fontSize: '0.85rem', color: '#f59e0b' }}>Tior</p>
              <div style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: '0.4rem' }}>
                <span style={{ color: '#fcd34d' }}>···</span> Rådata &nbsp;
                <span style={{ color: '#f59e0b' }}>—</span> EWA (trend) &nbsp;
                <span style={{ color: '#b45309' }}>— —</span> Linjär trend
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="datum" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 20]} tick={{ fontSize: 10 }} width={36} />
                  <Tooltip labelFormatter={(l) => `Datum: ${l}`} />
                  <Line type="monotone" dataKey="tior" stroke="#fcd34d" strokeWidth={1} strokeDasharray="3 3" dot={{ r: 3 }} activeDot={{ r: 5 }} name="Rådata" />
                  <Line type="monotone" dataKey="ewaT" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="EWA" />
                  <Line type="monotone" dataKey="trendT" stroke="#b45309" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Trend" />
                </LineChart>
              </ResponsiveContainer>
            </>
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
