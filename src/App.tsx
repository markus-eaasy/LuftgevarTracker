import { useEffect, useState } from 'react'
import './App.css'
import * as api from './api'
import { EventForm } from './components/EventForm'
import { EventList } from './components/EventList'
import { NavDropdown, type View } from './components/NavDropdown'
import { ProgressChart } from './components/ProgressChart'
import { ReleaseNotesModal } from './components/ReleaseNotesModal'
import { TargetIcon } from './components/TargetIcon'
import type { EventWithResults } from './types'

type SortOrder = 'asc' | 'desc'
type ResultFilter = 'alla' | 'tavling' | 'traning'

function App() {
  const [events, setEvents] = useState<EventWithResults[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReleaseNotes, setShowReleaseNotes] = useState(false)
  const [view, setView] = useState<View>('resultat')
  const [plannedSortOrder, setPlannedSortOrder] = useState<SortOrder>('asc')
  const [resultFilter, setResultFilter] = useState<ResultFilter>('alla')

  async function refresh() {
    try {
      setError(null)
      const data = await api.listEvents()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const plannedEvents = events
    .filter((event) => event.results.length === 0)
    .sort((a, b) =>
      plannedSortOrder === 'asc'
        ? a.event_date.localeCompare(b.event_date)
        : b.event_date.localeCompare(a.event_date)
    )

  const eventsWithResults = events
    .filter((event) => event.results.length > 0)
    .filter((event) => resultFilter === 'alla' || event.type === resultFilter)
    .sort((a, b) => b.event_date.localeCompare(a.event_date))

  return (
    <div className="app">
      <header>
        <div className="header-row">
          <NavDropdown value={view} onChange={setView} />
          <TargetIcon />
          <button type="button" className="release-notes-button" onClick={() => setShowReleaseNotes(true)}>
            Nytt i versionen
          </button>
        </div>
        <p className="muted">Logga träningar, tävlingar och resultat över tid.</p>
      </header>

      {showReleaseNotes && <ReleaseNotesModal onClose={() => setShowReleaseNotes(false)} />}

      {error && (
        <div className="card error">
          <p>{error}</p>
          <p className="muted">
            Kontrollera att du har skapat en <code>.env</code>-fil med Supabase-uppgifter (se <code>.env.example</code>)
            och att SQL-schemat i <code>supabase/schema.sql</code> är kört i ditt Supabase-projekt.
          </p>
        </div>
      )}

      {view === 'nytt-pass' && (
        <EventForm
          onSubmit={async (input) => {
            await api.createEvent(input)
            await refresh()
          }}
        />
      )}

      {view === 'planerade-pass' && (
        <>
          <div className="section-header-row">
            <h2>Planerade pass</h2>
            <select
              className="nav-dropdown"
              value={plannedSortOrder}
              onChange={(e) => setPlannedSortOrder(e.target.value as SortOrder)}
            >
              <option value="asc">Tidigast först</option>
              <option value="desc">Senast först</option>
            </select>
          </div>
          {loading ? (
            <p className="muted">Laddar…</p>
          ) : plannedEvents.length === 0 ? (
            <p className="muted">Inga planerade pass. Lägg till ett under "Nytt pass".</p>
          ) : (
            <EventList
              events={plannedEvents}
              onDeleteEvent={async (id) => {
                await api.deleteEvent(id)
                await refresh()
              }}
              onDeleteResult={async (id) => {
                await api.deleteResult(id)
                await refresh()
              }}
              onAddResult={async (input) => {
                await api.addResult(input)
                await refresh()
              }}
              onEditResult={async (id, input) => {
                await api.updateResult(id, input)
                await refresh()
              }}
            />
          )}
        </>
      )}

      {view === 'resultat' && (
        <>
          <ProgressChart events={eventsWithResults} />

          <div className="section-header-row">
            <h2>Resultat</h2>
            <select
              className="nav-dropdown"
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value as ResultFilter)}
            >
              <option value="alla">Alla</option>
              <option value="tavling">Tävling</option>
              <option value="traning">Träning</option>
            </select>
          </div>
          {loading ? (
            <p className="muted">Laddar…</p>
          ) : eventsWithResults.length === 0 ? (
            <p className="muted">Inga resultat registrerade ännu.</p>
          ) : (
            <EventList
              events={eventsWithResults}
              onDeleteEvent={async (id) => {
                await api.deleteEvent(id)
                await refresh()
              }}
              onDeleteResult={async (id) => {
                await api.deleteResult(id)
                await refresh()
              }}
              onAddResult={async (input) => {
                await api.addResult(input)
                await refresh()
              }}
              onEditResult={async (id, input) => {
                await api.updateResult(id, input)
                await refresh()
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default App
