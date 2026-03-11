/**
 * secondhandApi.ts  — C3 ✓ C8 ✓
 * Charlie Platform · Service layer para secondhand
 * Generado por ConstructorModulos
 * C8: sin supabase.from() directo en el View — toda la lógica aquí
 */
import { supabase } from '../../utils/supabase/client';

export interface SecondhandItem {
  id:          string;
  nombre?:     string;
  estado?:     string;
  created_at:  string;
  updated_at?: string;
  [key: string]: any;
}

export async function getAllSecondhand(params?: { search?: string; estado?: string }): Promise<SecondhandItem[]> {
  let query = supabase.from('secondhand').select('*');
  if (params?.search) query = query.ilike('nombre', `%${params.search}%`);
  if (params?.estado) query = query.eq('estado', params.estado);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('[secondhandApi]', error); throw new Error(error.message); }
  return data ?? [];
}

export async function getSecondhand(id: string): Promise<SecondhandItem | null> {
  const { data, error } = await supabase.from('secondhand').select('*').eq('id', id).single();
  if (error) { console.error('[secondhandApi]', error); return null; }
  return data;
}

export async function createSecondhand(payload: Partial<SecondhandItem>): Promise<SecondhandItem> {
  const { data, error } = await supabase.from('secondhand').insert(payload).select().single();
  if (error) { console.error('[secondhandApi]', error); throw new Error(error.message); }
  return data;
}

export async function updateSecondhand(id: string, payload: Partial<SecondhandItem>): Promise<SecondhandItem> {
  const { data, error } = await supabase
    .from('secondhand')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) { console.error('[secondhandApi]', error); throw new Error(error.message); }
  return data;
}

export async function deleteSecondhand(id: string): Promise<boolean> {
  const { error } = await supabase.from('secondhand').delete().eq('id', id);
  if (error) { console.error('[secondhandApi]', error); return false; }
  return true;
}
