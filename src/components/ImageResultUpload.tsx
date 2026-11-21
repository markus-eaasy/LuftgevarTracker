import { useEffect, useRef, useState } from 'react'
import * as api from '../api'
import { findFuzzyMatch } from '../utils/fuzzy'

interface Props {
  eventId: string
  onSaved: () => void
  onCancel: () => void
}

type Step = 'upload' | 'parsing' | 'review' | 'saving'

type EditRow = {
  key: string
  nr: string
  namn: string
  bana: string
  serie: string
  s1: string
  s2: string
  s3: string
  s4: string
  total: string
  inner_tior: string
}

function calcTotal(row: EditRow): number {
  const scores = [row.s1, row.s2, row.s3, row.s4].map(Number).filter((n) => !isNaN(n) && n > 0)
  return scores.length === 4 ? scores.reduce((a, b) => a + b, 0) : Number(row.total) || 0
}

function newRow(): EditRow {
  return { key: Math.random().toString(36).slice(2), nr: '', namn: '', bana: '', serie: '20 skott sittande', s1: '', s2: '', s3: '', s4: '', total: '', inner_tior: '' }
}

export function ImageResultUpload({ eventId, onSaved, onCancel }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<EditRow[]>([])
  const [existingNames, setExistingNames] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.listShooterNames().then(setExistingNames).catch(() => {})
  }, [])

  function updateRow(key: string, field: keyof EditRow, value: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r
        const updated = { ...r, [field]: value }
        // Auto-recalculate total when series scores change
        if (['s1', 's2', 's3', 's4'].includes(field)) {
          const scores = [
            field === 's1' ? value : updated.s1,
            field === 's2' ? value : updated.s2,
            field === 's3' ? value : updated.s3,
            field === 's4' ? value : updated.s4,
          ].map(Number)
          if (scores.every((n) => !isNaN(n) && n >= 0)) {
            updated.total = String(scores.reduce((a, b) => a + b, 0))
          }
        }
        return updated
      })
    )
  }

  async function handleFile(file: File) {
    setError(null)
    setStep('parsing')
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type || 'image/jpeg'
      try {
        const parsed = await api.parseResultImage(base64, mediaType)
        if (parsed.length === 0) {
          setError('Inga resultat hittades i bilden. Prova med en tydligare bild.')
          setStep('upload')
          return
        }
        const editRows: EditRow[] = parsed.map((s) => ({
          key: Math.random().toString(36).slice(2),
          nr: s.nr != null ? String(s.nr) : '',
          namn: s.namn,
          bana: s.bana != null ? String(s.bana) : '',
          serie: s.serie ?? '20 skott sittande',
          s1: s.seriepoang[0] != null ? String(s.seriepoang[0]) : '',
          s2: s.seriepoang[1] != null ? String(s.seriepoang[1]) : '',
          s3: s.seriepoang[2] != null ? String(s.seriepoang[2]) : '',
          s4: s.seriepoang[3] != null ? String(s.seriepoang[3]) : '',
          total: String(s.totalpoang),
          inner_tior: s.inner_tior != null ? String(s.inner_tior) : '',
        }))
        setRows(editRows)
        setStep('review')
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
      const shooters = rows.map((r) => ({
        nr: r.nr ? Number(r.nr) : null,
        namn: r.namn,
        bana: r.bana ? Number(r.bana) : null,
        serie: r.serie || null,
        seriepoang: [r.s1, r.s2, r.s3, r.s4]
          .map(Number)
          .filter((n) => !isNaN(n) && n >= 0 && (r.s1 || r.s2 || r.s3 || r.s4)),
        totalpoang: calcTotal(r),
        inner_tior: r.inner_tior ? Number(r.inner_tior) : null,
      }))
      await api.addResultsFromImage(eventId, shooters)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte spara')
      setStep('review')
    }
  }

  if (step === 'parsing') {
    return (
      <div className="image-upload-box">
        <p className="muted">Claude analyserar bilden…</p>
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

  if (step === 'review') {
    const hasWarnings = rows.some((r) => r.namn && findFuzzyMatch(r.namn, existingNames) !== null)

    return (
      <div className="image-upload-box">
        <p className="confirm-label">
          Granska och justera — {rows.length} skyttar hittade
        </p>

        {hasWarnings && (
          <div className="fuzzy-warning-banner">
            ⚠️ Ett eller flera namn liknar tidigare registrerade skyttar. Kontrollera markerade rader.
          </div>
        )}

        <div className="review-table-wrap">
          <table className="results-table review-table">
            <thead>
              <tr>
                <th>Nr</th>
                <th>Namn</th>
                <th>Bana</th>
                <th>Serie 1</th>
                <th>Serie 2</th>
                <th>Serie 3</th>
                <th>Serie 4</th>
                <th>Total</th>
                <th>Tior</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const fuzzy = r.namn ? findFuzzyMatch(r.namn, existingNames) : null
                return (
                  <>
                    <tr key={r.key} className={fuzzy ? 'row-warning' : undefined}>
                      <td>
                        <input className="cell-input narrow" value={r.nr} onChange={(e) => updateRow(r.key, 'nr', e.target.value)} />
                      </td>
                      <td>
                        <input
                          className={`cell-input wide${fuzzy ? ' input-warning' : ''}`}
                          value={r.namn}
                          onChange={(e) => updateRow(r.key, 'namn', e.target.value)}
                        />
                      </td>
                      <td>
                        <input className="cell-input narrow" value={r.bana} onChange={(e) => updateRow(r.key, 'bana', e.target.value)} />
                      </td>
                      <td><input className="cell-input score" value={r.s1} onChange={(e) => updateRow(r.key, 's1', e.target.value)} /></td>
                      <td><input className="cell-input score" value={r.s2} onChange={(e) => updateRow(r.key, 's2', e.target.value)} /></td>
                      <td><input className="cell-input score" value={r.s3} onChange={(e) => updateRow(r.key, 's3', e.target.value)} /></td>
                      <td><input className="cell-input score" value={r.s4} onChange={(e) => updateRow(r.key, 's4', e.target.value)} /></td>
                      <td>
                        <input className="cell-input score total-cell" value={r.total} readOnly />
                      </td>
                      <td><input className="cell-input score" value={r.inner_tior} onChange={(e) => updateRow(r.key, 'inner_tior', e.target.value)} /></td>
                      <td>
                        <button
                          type="button"
                          className="danger small"
                          onClick={() => setRows((prev) => prev.filter((x) => x.key !== r.key))}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                    {fuzzy && (
                      <tr key={`${r.key}-warn`} className="fuzzy-hint-row">
                        <td colSpan={10}>
                          ⚠️ Liknar befintlig skytt: <strong>{fuzzy}</strong> — rätt namn? Korrigera i fältet ovan om det ska vara samma person.
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          className="secondary small"
          style={{ marginTop: '0.5rem' }}
          onClick={() => setRows((prev) => [...prev, newRow()])}
        >
          + Lägg till rad
        </button>

        {error && <p className="error-text">{error}</p>}

        <div className="button-row" style={{ marginTop: '1rem' }}>
          <button type="button" onClick={handleSave}>
            Spara alla ({rows.length})
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
          📷 Välj bild / Ta foto
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Avbryt
        </button>
      </div>
      <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
        Ta en skarp bild på utskriften — Claude läser av alla namn och poäng automatiskt.
      </p>
    </div>
  )
}
