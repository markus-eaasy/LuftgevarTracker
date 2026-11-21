function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Returns the closest existing name if suspiciously similar, otherwise null. */
export function findFuzzyMatch(name: string, existingNames: string[]): string | null {
  const norm = normalize(name)
  if (!norm) return null

  let best: string | null = null
  let bestDist = Infinity

  for (const existing of existingNames) {
    const normEx = normalize(existing)
    if (normEx === norm) return null // exact match — no warning needed
    const dist = levenshtein(norm, normEx)
    // Flag if edit distance ≤ 3 for longer names, ≤ 2 for short names
    const threshold = norm.length > 8 ? 3 : 2
    if (dist <= threshold && dist < bestDist) {
      best = existing
      bestDist = dist
    }
  }

  return best
}
