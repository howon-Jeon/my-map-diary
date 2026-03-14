import { supabase } from './supabase'
import { Place, NewPlace } from '@/types/place'

/**
 * 모든 장소를 최신순으로 조회한다
 */
export async function getPlaces(): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`장소 조회 실패: ${error.message}`)
  return data ?? []
}

/**
 * 새 장소를 추가하고 추가된 장소를 반환한다
 */
export async function addPlace(place: NewPlace): Promise<Place> {
  const { data, error } = await supabase
    .from('places')
    .insert(place)
    .select()
    .single()

  if (error) throw new Error(`장소 추가 실패: ${error.message}`)
  return data
}

/**
 * 기존 장소를 부분 업데이트하고 업데이트된 장소를 반환한다
 */
export async function updatePlace(
  id: string,
  updates: Partial<Omit<Place, 'id' | 'created_at' | 'updated_at'>>
): Promise<Place> {
  const { data, error } = await supabase
    .from('places')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`장소 수정 실패: ${error.message}`)
  return data
}

/**
 * 장소를 삭제한다
 */
export async function deletePlace(id: string): Promise<void> {
  const { error } = await supabase
    .from('places')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`장소 삭제 실패: ${error.message}`)
}

/**
 * 사진을 Supabase Storage에 업로드하고 URL을 반환한다
 */
export async function uploadPlacePhoto(file: File): Promise<string> {
  const { v4: uuidv4 } = await import('uuid')
  const ext = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${ext}`

  const { error } = await supabase.storage
    .from('place-photos')
    .upload(fileName, file)

  if (error) throw new Error(`사진 업로드 실패: ${error.message}`)

  const { data } = supabase.storage
    .from('place-photos')
    .getPublicUrl(fileName)

  return data.publicUrl
}
