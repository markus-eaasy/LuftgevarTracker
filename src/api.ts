import { supabase } from './lib/supabase'
import type { EventType, EventWithResults, ParsedShooterResult, Result, ShootingEvent } from './types'

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
  shooter_name?: string
  shooter_nr?: number
  bana?: number
  serie?: string
  series_scores?: number[]
  series_count?: number
  shots_per_series?: number
  total_score: number
  inner_tens?: number
  notes?: string
}): Promise<Result> {
  const { data, error } = await supabase.from('results').insert(input).select().single()
  if (error) throw error
  return data as Result
}

export async function addResultsFromImage(
  eventId: string,
  shooters: ParsedShooterResult[]
): Promise<Result[]> {
  const rows = shooters.map((s) => ({
    event_id: eventId,
    shooter_name: s.namn,
    shooter_nr: s.nr ?? null,
    bana: s.bana ?? null,
    serie: s.serie ?? null,
    series_scores: s.seriepoang.length > 0 ? s.seriepoang : null,
    series_count: s.seriepoang.length > 0 ? s.seriepoang.length : 4,
    shots_per_series: s.seriepoang.length > 0 ? Math.round(s.totalpoang / s.seriepoang.length) : 5,
    total_score: s.totalpoang,
    inner_tens: s.inner_tior ?? null,
  }))

  const { data, error } = await supabase.from('results').insert(rows).select()
  if (error) throw error
  return data as Result[]
}

export async function deleteResult(id: string): Promise<void> {
  const { error } = await supabase.from('results').delete().eq('id', id)
  if (error) throw error
}

export async function parseResultImage(
  imageBase64: string,
  mediaType: string
): Promise<ParsedShooterResult[]> {
  const { data, error } = await supabase.functions.invoke('parse-result-image', {
    body: { image_base64: imageBase64, media_type: mediaType },
  })

  if (error) throw new Error(error.message)
  if (data.error) throw new Error(data.error)
  return data.results as ParsedShooterResult[]
}
