import { supabase } from './supabase'

export async function submitReport({ binId, issueType, description, photo }) {
  // demo mode: no backend yet
  if (!supabase) {
    await new Promise((r) => setTimeout(r, 600))
    return { ok: true }
  }

  let photo_path = null
  if (photo) {
    const ext = photo.name.split('.').pop()
    photo_path = `${crypto.randomUUID()}.${ext}`   // random name, never trust the user's
    const { error } = await supabase.storage
      .from('report-photos')
      .upload(photo_path, photo, { contentType: photo.type })
    if (error) return { ok: false, error: error.message }
  }

  // no .select() here: anon has no read access, so returning the row would fail
  const { error } = await supabase.from('reports').insert({
    bin_id: binId,
    issue_type: issueType,
    description: description.trim() || null,
    photo_path,
  })

  return error ? { ok: false, error: error.message } : { ok: true }
}