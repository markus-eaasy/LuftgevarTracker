import { supabase } from './lib/supabase'
import type { EventType, EventWithResults, Result, ShootingEvent } from './types'

export async function listEvents(): Promise<EventWithResults[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*, results(*)')
    .order('event_date', { ascending: false })

  if (error) throw error
  return data as EventWithResults[]
}

export async function createEvent(input: {
  type: EventType
  title: string
  event_date: string
  location?: string
  notes?: string
}): Promise<ShootingEvent> {
  const { data, error } = await supabase.from('events').insert(input).select().single()
  if (error) throw error
  return data as ShootingEvent
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function addResult(input: {
  event_id: string
  series_count: number
  shots_per_series: number
  total_score: number
  inner_tens?: number
  notes?: string
}): Promise<Result> {
  const { data, error } = await supabase.from('results').insert(input).select().single()
  if (error) throw error
  return data as Result
}

export async function deleteResult(id: string): Promise<void> {
  const { error } = await supabase.from('results').delete().eq('id', id)
  if (error) throw error
}
