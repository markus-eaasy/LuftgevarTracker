import { useState, type FormEvent } from 'react'

interface Props {
  eventId: string
  onSubmit: (input: {
    event_id: string
    shooter_name?: string
    total_score: number
    inner_tens?: number
    notes?: string
  }) => Promise<void>
  onCancel: () => void
}

export function ResultForm({ eventId, onSubmit, onCancel }: Props) {
  const [shooterName, setShooterName] = useState('')
  const [totalScore, setTotalScore] = useState('')
  const [innerTens, setInnerTens] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!totalScore) return
    setSubmitting(true)
    try {
      await onSubmit({
        event_id: eventId,
        shooter_name: shooterName || undefined,
        total_score: Number(totalScore),
        inner_tens: innerTens ? Number(innerTens) : undefined,
        notes: notes || undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="result-form" onSubmit={handleSubmit}>
      <label>
        Skyttens namn
        <input
          value={shooterName}
          onChange={(e) => setShooterName(e.target.value)}
          placeholder="t.ex. Hans Narup"
        />
      </label>
      <label>
        Totalpoäng
        <input
          type="number"
          step="0.1"
          value={totalScore}
          onChange={(e) => setTotalScore(e.target.value)}
          required
        />
      </label>
      <label>
        Antal inner-tior
        <input type="number" min={0} value={innerTens} onChange={(e) => setInnerTens(e.target.value)} />
      </label>
      <label>
        Anteckningar
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div className="result-form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sparar…' : 'Spara resultat'}
        </button>
        <button type="button" onClick={onCancel}>
          Avbryt
        </button>
      </div>
    </form>
  )
}
