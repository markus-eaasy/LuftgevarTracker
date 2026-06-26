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
  series_count: number
  shots_per_series: number
  total_score: number
  inner_tens: number | null
  notes: string | null
  created_at: string
}

export interface EventWithResults extends ShootingEvent {
  results: Result[]
}
