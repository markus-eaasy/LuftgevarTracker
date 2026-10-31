import { useState } from 'react'
import type { EventWithResults } from '../types'
import { ImageResultUpload } from './ImageResultUpload'
import { ResultForm } from './ResultForm'

interface Props {
  events: EventWithResults[]
  onDeleteEvent: (id: string) => Promise<void>
  onDeleteResult: (id: string) => Promise<void>
  onAddResult: (input: {
    event_id: string
    shooter_name?: string
    total_score: number
    inner_tens?: number
    notes?: string
  }) => Promise<void>
  onRefresh: () => Promise<void>
}

type AddMode = 'image' | 'manual' | null

export function EventList({ events, onDeleteEvent, onDeleteResult, onAddResult, onRefresh }: Props) {
  const [addingFor, setAddingFor] = useState<{ id: string; mode: AddMode }>({ id: '', mode: null })

  if (events.length === 0) {
    return <p className="muted">Inga pass tillagda ännu. Lägg till en träning eller tävling ovan.</p>
  }

  function formatResult(result: EventWithResults['results'][0]) {
    if (result.series_scores && result.series_scores.length > 0) {
      return `${result.series_scores.join(' + ')} = ${result.total_score}`
    }
    return String(result.total_score)
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
            <button type="button" className="danger small" onClick={() => onDeleteEvent(event.id)}>
              Ta bort
            </button>
          </div>

          {event.results.length > 0 && (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Nr</th>
                  <th>Namn</th>
                  <th>Bana</th>
                  <th>Resultat</th>
                  <th>Tior</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {event.results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.shooter_nr ?? '–'}</td>
                    <td>{result.shooter_name ?? '–'}</td>
                    <td>{result.bana ?? '–'}</td>
                    <td>{formatResult(result)}</td>
                    <td>{result.inner_tens ?? '–'}</td>
                    <td>
                      <button
                        type="button"
                        className="danger small"
                        onClick={() => onDeleteResult(result.id)}
                      >
                        Ta bort
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {addingFor.id === event.id && addingFor.mode === 'image' && (
            <ImageResultUpload
              eventId={event.id}
              onSaved={async () => {
                setAddingFor({ id: '', mode: null })
                await onRefresh()
              }}
              onCancel={() => setAddingFor({ id: '', mode: null })}
            />
          )}

          {addingFor.id === event.id && addingFor.mode === 'manual' && (
            <ResultForm
              eventId={event.id}
              onSubmit={async (input) => {
                await onAddResult(input)
                setAddingFor({ id: '', mode: null })
              }}
              onCancel={() => setAddingFor({ id: '', mode: null })}
            />
          )}

          {addingFor.id !== event.id && (
            <div className="button-row">
              <button
                type="button"
                onClick={() => setAddingFor({ id: event.id, mode: 'image' })}
              >
                📷 Ladda upp bild
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => setAddingFor({ id: event.id, mode: 'manual' })}
              >
                + Lägg till manuellt
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
