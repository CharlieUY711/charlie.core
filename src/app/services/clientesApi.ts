/**
 * clientesApi.ts  — C3 ✓ C8 ✓
 * Charlie Platform · Service layer para clientes
 * Generado por ConstructorModulos
 * C8: sin supabase.from() directo en el View — toda la lógica aquí
 */
import { supabase } from '../../utils/supabase/client';

export interface ClientesItem {
  id:          string;
  nombre?:     string;
  estado?:     string;
  created_at:  string;
  updated_at?: string;
  [key: string]: any;
}

export async function getAllClientes(params?: { search?: string; estado?: string }): Promise<ClientesItem[]> {
  let query = supabase.from('clientes').select('*');
  if (params?.search) query = query.ilike('nombre', `%${params.search}%`);
  if (params?.estado) query = query.eq('estado', params.estado);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('[clientesApi]', error); throw new Error(error.message); }
  return data ?? [];
}

export async function getClientes(id: string): Promise<ClientesItem | null> {
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).single();
  if (error) { console.error('[clientesApi]', error); return null; }
  return data;
}

export async function createClientes(payload: Partial<ClientesItem>): Promise<ClientesItem> {
  const { data, error } = await supabase.from('clientes').insert(payload).select().single();
  if (error) { console.error('[clientesApi]', error); throw new Error(error.message); }
  return data;
}

export async function updateClientes(id: string, payload: Partial<ClientesItem>): Promise<ClientesItem> {
  const { data, error } = await supabase
    .from('clientes')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) { console.error('[clientesApi]', error); throw new Error(error.message); }
  return data;
}

export async function deleteClientes(id: string): Promise<boolean> {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) { console.error('[clientesApi]', error); return false; }
  return true;
}
