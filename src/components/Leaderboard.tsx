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
}

const MEDALS = ['🥇', '🥈', '🥉']

export function Leaderboard({ events }: Props) {
  const allResults = events.flatMap((e) =>
    e.results.map((r) => ({ ...r, event_date: e.event_date, event_type: e.type }))
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
      bestScore: Math.max(...scores),
      avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      bestInnerTens: tens.length > 0 ? Math.max(...tens) : null,
      avgInnerTens: tens.length > 0 ? Math.round((tens.reduce((a, b) => a + b, 0) / tens.length) * 10) / 10 : null,
      latestDate: results.map((r) => r.event_date).sort().at(-1) ?? '',
    }
  })

  stats.sort((a, b) => b.bestScore - a.bestScore || b.avgScore - a.avgScore)

  if (stats.length === 0) {
    return <p className="muted">Inga resultat registrerade ännu.</p>
  }

  const best = stats[0].bestScore

  return (
    <div className="leaderboard">
      <div className="podium-row">
        {stats.slice(0, 3).map((s, i) => (
          <div key={s.namn} className={`podium-card podium-${i + 1}`}>
            <div className="podium-medal">{MEDALS[i]}</div>
            <div className="podium-name">{s.namn}</div>
            <div className="podium-score">{s.bestScore}</div>
            <div className="podium-label">bästa poäng</div>
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
              <tr key={s.namn} className={i < 3 ? 'top-three' : undefined}>
                <td className="rank-cell">{MEDALS[i] ?? i + 1}</td>
                <td className="name-cell">{s.namn}</td>
                <td>
                  <span className="score-bar-wrap">
                    <span
                      className="score-bar"
                      style={{ width: `${Math.round((s.bestScore / best) * 100)}%` }}
                    />
                    <span className="score-val">{s.bestScore}</span>
                  </span>
                </td>
                <td>{s.avgScore}</td>
                <td>{s.sessions}</td>
                <td>{s.bestInnerTens ?? '–'}</td>
                <td className="muted">{s.latestDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
