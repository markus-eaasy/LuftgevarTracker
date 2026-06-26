import { useState } from 'react'
import type { EventWithResults } from '../types'
import { ResultForm } from './ResultForm'

interface Props {
  events: EventWithResults[]
  onDeleteEvent: (id: string) => Promise<void>
  onDeleteResult: (id: string) => Promise<void>
  onAddResult: (input: {
    event_id: string
    series_count: number
    shots_per_series: number
    total_score: number
    inner_tens?: number
    notes?: string
  }) => Promise<void>
}

export function EventList({ events, onDeleteEvent, onDeleteResult, onAddResult }: Props) {
  const [addingResultFor, setAddingResultFor] = useState<string | null>(null)

  if (events.length === 0) {
    return <p className="muted">Inga pass tillagda ännu. Lägg till en träning eller tävling ovan.</p>
  }

  return (
    <div className="event-list">
      {events.map((event) => (
        <div className="card event-card" key={event.id}>
          <div className="event-header">
            <div>
              <span className={`badge ${event.type}`}>{event.type === 'traning' ? 'Träning' : 'Tävling'}</span>
              <h3>{event.title}</h3>
              <p className="muted">
                {event.event_date}
                {event.location ? ` · ${event.location}` : ''}
              </p>
              {event.notes && <p className="muted">{event.notes}</p>}
            </div>
            <button type="button" className="danger" onClick={() => onDeleteEvent(event.id)}>
              Ta bort
            </button>
          </div>

          {event.results.length > 0 && (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Serier</th>
                  <th>Skott/serie</th>
                  <th>Totalpoäng</th>
                  <th>Inner-tior</th>
                  <th>Anteckningar</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {event.results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.series_count}</td>
                    <td>{result.shots_per_series}</td>
                    <td>{result.total_score}</td>
                    <td>{result.inner_tens ?? '-'}</td>
                    <td>{result.notes ?? '-'}</td>
                    <td>
                      <button type="button" className="danger small" onClick={() => onDeleteResult(result.id)}>
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {addingResultFor === event.id ? (
            <ResultForm
              eventId={event.id}
              onSubmit={async (input) => {
                await onAddResult(input)
                setAddingResultFor(null)
              }}
              onCancel={() => setAddingResultFor(null)}
            />
          ) : (
            <button type="button" onClick={() => setAddingResultFor(event.id)}>
              Lägg till resultat
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
