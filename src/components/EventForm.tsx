import { useState, type FormEvent } from 'react'
import type { EventType } from '../types'

interface Props {
  onSubmit: (input: {
    type: EventType
    title: string
    event_date: string
    location?: string
    notes?: string
  }) => Promise<void>
}

export function EventForm({ onSubmit }: Props) {
  const [type, setType] = useState<EventType>('traning')
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title || !eventDate) return
    setSubmitting(true)
    try {
      await onSubmit({ type, title, event_date: eventDate, location, notes })
      setTitle('')
      setEventDate('')
      setLocation('')
      setNotes('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Nytt pass</h2>
      <label>
        Typ
        <select value={type} onChange={(e) => setType(e.target.value as EventType)}>
          <option value="traning">Träning</option>
          <option value="tavling">Tävling</option>
        </select>
      </label>
      <label>
        Titel
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="t.ex. Klubbtävling vår" required />
      </label>
      <label>
        Datum
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
      </label>
      <label>
        Plats
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="t.ex. Hemmabanan" />
      </label>
      <label>
        Anteckningar
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Sparar…' : 'Lägg till'}
      </button>
    </form>
  )
}
