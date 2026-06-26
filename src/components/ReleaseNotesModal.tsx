import { releaseNotes } from '../releaseNotes'

interface Props {
  onClose: () => void
}

export function ReleaseNotesModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nytt i versionen</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Stäng">
            ✕
          </button>
        </div>
        {releaseNotes.map((note) => (
          <div key={note.date} className="release-note">
            <h3>{note.date}</h3>
            <ul>
              {note.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
