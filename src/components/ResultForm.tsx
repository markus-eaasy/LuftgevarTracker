import { useState, type FormEvent } from 'react'

interface ResultInput {
  series_count?: number
  shots_per_series?: number
  total_score: number
  inner_tens?: number
  notes?: string
  shooter_name?: string
}

interface Props {
  eventId: string
  initialValues?: {
    series_count: number
    shots_per_series: number
    total_score: number
    inner_tens?: number
    notes?: string
  }
  submitLabel?: string
  onSubmit: (input: { event_id: string } & ResultInput) => Promise<void>
  onCancel: () => void
}

export function ResultForm({ eventId, initialValues, submitLabel, onSubmit, onCancel }: Props) {
  const [shooterName, setShooterName] = useState('')
  const [totalScore, setTotalScore] = useState(initialValues ? String(initialValues.total_score) : '')
  const [innerTens, setInnerTens] = useState(initialValues?.inner_tens ? String(initialValues.inner_tens) : '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!totalScore) return
    setSubmitting(true)
    try {
      await onSubmit({
        event_id: eventId,
        shooter_name: shooterName || undefined,
        series_count: initialValues?.series_count,
        shots_per_series: initialValues?.shots_per_series,
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
      {!initialValues && (
        <label>
          Skyttens namn
          <input
            value={shooterName}
            onChange={(e) => setShooterName(e.target.value)}
            placeholder="t.ex. Hans Narup"
          />
        </label>
      )}
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
          {submitting ? 'Sparar…' : (submitLabel ?? 'Spara resultat')}
        </button>
        <button type="button" onClick={onCancel}>
          Avbryt
        </button>
      </div>
    </form>
  )
}
