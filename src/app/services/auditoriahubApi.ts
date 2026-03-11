/**
 * auditoriahubApi.ts  — C3 ✓ C8 ✓
 * Charlie Platform · Service layer para auditoriahub
 * Generado por ConstructorModulos
 * C8: sin supabase.from() directo en el View — toda la lógica aquí
 */
import { supabase } from '../../utils/supabase/client';

export interface AuditoriahubItem {
  id:          string;
  nombre?:     string;
  estado?:     string;
  created_at:  string;
  updated_at?: string;
  [key: string]: any;
}

export async function getAllAuditoriahub(params?: { search?: string; estado?: string }): Promise<AuditoriahubItem[]> {
  let query = supabase.from('auditoriahub').select('*');
  if (params?.search) query = query.ilike('nombre', `%${params.search}%`);
  if (params?.estado) query = query.eq('estado', params.estado);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('[auditoriahubApi]', error); throw new Error(error.message); }
  return data ?? [];
}

export async function getAuditoriahub(id: string): Promise<AuditoriahubItem | null> {
  const { data, error } = await supabase.from('auditoriahub').select('*').eq('id', id).single();
  if (error) { console.error('[auditoriahubApi]', error); return null; }
  return data;
}

export async function createAuditoriahub(payload: Partial<AuditoriahubItem>): Promise<AuditoriahubItem> {
  const { data, error } = await supabase.from('auditoriahub').insert(payload).select().single();
  if (error) { console.error('[auditoriahubApi]', error); throw new Error(error.message); }
  return data;
}

export async function updateAuditoriahub(id: string, payload: Partial<AuditoriahubItem>): Promise<AuditoriahubItem> {
  const { data, error } = await supabase
    .from('auditoriahub')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) { console.error('[auditoriahubApi]', error); throw new Error(error.message); }
  return data;
}

export async function deleteAuditoriahub(id: string): Promise<boolean> {
  const { error } = await supabase.from('auditoriahub').delete().eq('id', id);
  if (error) { console.error('[auditoriahubApi]', error); return false; }
  return true;
}
