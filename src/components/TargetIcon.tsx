export function TargetIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Luftgevärstracker"
    >
      <circle cx="50" cy="50" r="42" fill="none" stroke="black" strokeWidth="4" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="black" strokeWidth="4" />
      <circle cx="50" cy="50" r="18" fill="none" stroke="black" strokeWidth="4" />
      <circle cx="50" cy="50" r="6" fill="black" />
      <line x1="50" y1="2" x2="50" y2="14" stroke="black" strokeWidth="3" />
      <line x1="50" y1="86" x2="50" y2="98" stroke="black" strokeWidth="3" />
      <line x1="2" y1="50" x2="14" y2="50" stroke="black" strokeWidth="3" />
      <line x1="86" y1="50" x2="98" y2="50" stroke="black" strokeWidth="3" />
    </svg>
  )
}
