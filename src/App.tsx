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

function App() {
  const [events, setEvents] = useState<EventWithResults[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReleaseNotes, setShowReleaseNotes] = useState(false)
  const [view, setView] = useState<View>('resultat')

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

  const today = new Date().toISOString().slice(0, 10)
  const plannedEvents = events.filter((event) => event.event_date >= today)

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
          <h2>Planerade pass</h2>
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
            />
          )}
        </>
      )}

      {view === 'resultat' && (
        <>
          <ProgressChart events={events} />

          <h2>Alla pass</h2>
          {loading ? (
            <p className="muted">Laddar…</p>
          ) : (
            <EventList
              events={events}
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
            />
          )}
        </>
      )}
    </div>
  )
}

export default App
