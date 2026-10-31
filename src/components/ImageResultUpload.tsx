import { useRef, useState } from 'react'
import type { ParsedShooterResult } from '../types'
import * as api from '../api'

interface Props {
  eventId: string
  onSaved: () => void
  onCancel: () => void
}

type Step = 'upload' | 'parsing' | 'confirm' | 'saving'

export function ImageResultUpload({ eventId, onSaved, onCancel }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedShooterResult[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError(null)
    setStep('parsing')

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type || 'image/jpeg'

      try {
        const results = await api.parseResultImage(base64, mediaType)
        if (results.length === 0) {
          setError('Inga resultat hittades i bilden. Försök med en tydligare bild.')
          setStep('upload')
          return
        }
        setParsed(results)
        setStep('confirm')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Kunde inte tolka bilden')
        setStep('upload')
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setStep('saving')
    try {
      await api.addResultsFromImage(eventId, parsed)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte spara')
      setStep('confirm')
    }
  }

  if (step === 'parsing') {
    return (
      <div className="image-upload-box">
        <p className="muted">Analyserar bilden…</p>
      </div>
    )
  }

  if (step === 'saving') {
    return (
      <div className="image-upload-box">
        <p className="muted">Sparar resultat…</p>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="image-upload-box">
        <p className="confirm-label">Hittade {parsed.length} skyttar — stämmer det?</p>
        <table className="results-table">
          <thead>
            <tr>
              <th>Nr</th>
              <th>Namn</th>
              <th>Bana</th>
              <th>Resultat</th>
              <th>Tior</th>
            </tr>
          </thead>
          <tbody>
            {parsed.map((s, i) => (
              <tr key={i}>
                <td>{s.nr ?? '–'}</td>
                <td>{s.namn}</td>
                <td>{s.bana ?? '–'}</td>
                <td>
                  {s.seriepoang.length > 0
                    ? `${s.seriepoang.join(' + ')} = ${s.totalpoang}`
                    : s.totalpoang}
                </td>
                <td>{s.inner_tior ?? '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <p className="error-text">{error}</p>}
        <div className="button-row">
          <button type="button" onClick={handleSave}>
            Spara alla
          </button>
          <button type="button" className="secondary" onClick={() => setStep('upload')}>
            Ladda upp igen
          </button>
          <button type="button" className="secondary" onClick={onCancel}>
            Avbryt
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="image-upload-box">
      <p className="confirm-label">Ladda upp bild på resultatlistan</p>
      {error && <p className="error-text">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
      <div className="button-row">
        <button type="button" onClick={() => fileRef.current?.click()}>
          Välj bild / Ta foto
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Avbryt
        </button>
      </div>
      <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
        Tar en skarp bild på utskriften — Claude läser av alla namn och poäng automatiskt.
      </p>
    </div>
  )
}
