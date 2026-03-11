/**
 * cargamasivaApi.ts  — C3 ✓ C8 ✓
 * Charlie Platform · Service layer para cargamasiva
 * Generado por ConstructorModulos
 * C8: sin supabase.from() directo en el View — toda la lógica aquí
 */
import { supabase } from '../../utils/supabase/client';

export interface CargamasivaItem {
  id:          string;
  nombre?:     string;
  estado?:     string;
  created_at:  string;
  updated_at?: string;
  [key: string]: any;
}

export async function getAllCargamasiva(params?: { search?: string; estado?: string }): Promise<CargamasivaItem[]> {
  let query = supabase.from('cargamasiva').select('*');
  if (params?.search) query = query.ilike('nombre', `%${params.search}%`);
  if (params?.estado) query = query.eq('estado', params.estado);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('[cargamasivaApi]', error); throw new Error(error.message); }
  return data ?? [];
}

export async function getCargamasiva(id: string): Promise<CargamasivaItem | null> {
  const { data, error } = await supabase.from('cargamasiva').select('*').eq('id', id).single();
  if (error) { console.error('[cargamasivaApi]', error); return null; }
  return data;
}

export async function createCargamasiva(payload: Partial<CargamasivaItem>): Promise<CargamasivaItem> {
  const { data, error } = await supabase.from('cargamasiva').insert(payload).select().single();
  if (error) { console.error('[cargamasivaApi]', error); throw new Error(error.message); }
  return data;
}

export async function updateCargamasiva(id: string, payload: Partial<CargamasivaItem>): Promise<CargamasivaItem> {
  const { data, error } = await supabase
    .from('cargamasiva')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) { console.error('[cargamasivaApi]', error); throw new Error(error.message); }
  return data;
}

export async function deleteCargamasiva(id: string): Promise<boolean> {
  const { error } = await supabase.from('cargamasiva').delete().eq('id', id);
  if (error) { console.error('[cargamasivaApi]', error); return false; }
  return true;
}
