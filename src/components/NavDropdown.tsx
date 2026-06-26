export type View = 'nytt-pass' | 'planerade-pass' | 'resultat'

interface Props {
  value: View
  onChange: (view: View) => void
}

const options: { value: View; label: string }[] = [
  { value: 'nytt-pass', label: 'Nytt pass' },
  { value: 'planerade-pass', label: 'Planerade pass' },
  { value: 'resultat', label: 'Resultat' },
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
