export type View = 'nytt-pass' | 'resultat' | 'leaderboard'

interface Props {
  value: View
  onChange: (view: View) => void
}

const options: { value: View; label: string }[] = [
  { value: 'nytt-pass', label: 'Nytt pass' },
  { value: 'resultat', label: 'Resultat' },
  { value: 'leaderboard', label: '🏆 Leaderboard' },
]

export function NavDropdown({ value, onChange }: Props) {
  return (
    <select className="nav-dropdown" value={value} onChange={(e) => onChange(e.target.value as View)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
