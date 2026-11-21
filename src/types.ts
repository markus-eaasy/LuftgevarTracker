export type EventType = 'traning' | 'tavling'

export interface ShootingEvent {
  id: string
  type: EventType
  title: string
  event_date: string
  location: string | null
  notes: string | null
  created_at: string
}

export interface Result {
  id: string
  event_id: string
  shooter_name: string | null
  shooter_nr: number | null
  bana: number | null
  serie: string | null
  series_scores: number[] | null
  series_count: number
  shots_per_series: number
  total_score: number
  inner_tens: number | null
  notes: string | null
  created_at: string
}

export interface ParsedShooterResult {
  nr: number | null
  namn: string
  bana: number | null
  serie: string | null
  seriepoang: number[]
  totalpoang: number
  inner_tior: number | null
}

export interface EventWithResults extends ShootingEvent {
  results: Result[]
}
