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
  onEditResult: (
    id: string,
    input: {
      series_count: number
      shots_per_series: number
      total_score: number
      inner_tens?: number
      notes?: string
    },
  ) => Promise<void>
  onRefresh: () => Promise<void>
  autoOpenImageFor?: string | null
  onAutoOpenDone?: () => void
}

type PendingDelete = { kind: 'event' | 'result'; id: string }
type AddMode = 'image' | 'manual' | null

export function EventList({ events, onDeleteEvent, onDeleteResult, onAddResult, onEditResult, onRefresh, autoOpenImageFor }: Props) {
  const [addingFor, setAddingFor] = useState<{ id: string; mode: AddMode }>({ id: autoOpenImageFor ?? '', mode: autoOpenImageFor ? 'image' : null })
  const [editingResultId, setEditingResultId] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

  if (events.length === 0) {
    return <p className="muted">Inga pass tillagda ännu. Lägg till en träning eller tävling ovan.</p>
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    if (pendingDelete.kind === 'event') {
      await onDeleteEvent(pendingDelete.id)
    } else {
      await onDeleteResult(pendingDelete.id)
    }
    setPendingDelete(null)
  }

  function formatResult(result: EventWithResults['results'][0]) {
    if (result.series_scores && result.series_scores.length > 0) {
      return `${result.series_scores.join(' + ')} = ${result.total_score}`
    }
    return String(result.total_score)
  }

  return (
    <div className="event-list">
      {pendingDelete && (
        <div className="modal-overlay" onClick={() => setPendingDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p>
              {pendingDelete.kind === 'event'
                ? 'Är du säker på att du vill ta bort detta pass?'
                : 'Är du säker på att du vill ta bort detta resultat?'}
            </p>
            <div className="result-form-actions">
              <button type="button" className="danger" onClick={confirmDelete}>
                Ta bort
              </button>
              <button type="button" onClick={() => setPendingDelete(null)}>
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

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
            <button
              type="button"
              className="danger small"
              onClick={() => setPendingDelete({ kind: 'event', id: event.id })}
            >
              Ta bort
            </button>
          </div>

          {event.results.length > 0 && (
            <div className="results-table-wrapper">
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
                          onClick={() => setPendingDelete({ kind: 'result', id: result.id })}
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {event.results
            .filter((result) => result.id === editingResultId)
            .map((result) => (
              <ResultForm
                key={result.id}
                eventId={event.id}
                submitLabel="Spara ändringar"
                initialValues={{
                  series_count: result.series_count,
                  shots_per_series: result.shots_per_series,
                  total_score: result.total_score,
                  inner_tens: result.inner_tens ?? undefined,
                  notes: result.notes ?? undefined,
                }}
                onSubmit={async (input) => {
                  await onEditResult(result.id, {
                    series_count: input.series_count ?? result.series_count,
                    shots_per_series: input.shots_per_series ?? result.shots_per_series,
                    total_score: input.total_score,
                    inner_tens: input.inner_tens,
                    notes: input.notes,
                  })
                  setEditingResultId(null)
                }}
                onCancel={() => setEditingResultId(null)}
              />
            ))}

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
                await onAddResult({
                  event_id: input.event_id,
                  shooter_name: input.shooter_name,
                  total_score: input.total_score,
                  inner_tens: input.inner_tens,
                  notes: input.notes,
                })
                setAddingFor({ id: '', mode: null })
              }}
              onCancel={() => setAddingFor({ id: '', mode: null })}
            />
          )}

          {addingFor.id !== event.id && (
            <div className="button-row">
              <button type="button" onClick={() => setAddingFor({ id: event.id, mode: 'image' })}>
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
