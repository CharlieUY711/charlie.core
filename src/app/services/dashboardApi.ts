/**
 * dashboardApi.ts  — C3 ✓ C8 ✓
 * Charlie Platform · Service layer para dashboard
 * Generado por ConstructorModulos
 * C8: sin supabase.from() directo en el View — toda la lógica aquí
 */
import { supabase } from '../../utils/supabase/client';

export interface DashboardItem {
  id:          string;
  nombre?:     string;
  estado?:     string;
  created_at:  string;
  updated_at?: string;
  [key: string]: any;
}

export async function getAllDashboard(params?: { search?: string; estado?: string }): Promise<DashboardItem[]> {
  let query = supabase.from('dashboard').select('*');
  if (params?.search) query = query.ilike('nombre', `%${params.search}%`);
  if (params?.estado) query = query.eq('estado', params.estado);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) { console.error('[dashboardApi]', error); throw new Error(error.message); }
  return data ?? [];
}

export async function getDashboard(id: string): Promise<DashboardItem | null> {
  const { data, error } = await supabase.from('dashboard').select('*').eq('id', id).single();
  if (error) { console.error('[dashboardApi]', error); return null; }
  return data;
}

export async function createDashboard(payload: Partial<DashboardItem>): Promise<DashboardItem> {
  const { data, error } = await supabase.from('dashboard').insert(payload).select().single();
  if (error) { console.error('[dashboardApi]', error); throw new Error(error.message); }
  return data;
}

export async function updateDashboard(id: string, payload: Partial<DashboardItem>): Promise<DashboardItem> {
  const { data, error } = await supabase
    .from('dashboard')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) { console.error('[dashboardApi]', error); throw new Error(error.message); }
  return data;
}

export async function deleteDashboard(id: string): Promise<boolean> {
  const { error } = await supabase.from('dashboard').delete().eq('id', id);
  if (error) { console.error('[dashboardApi]', error); return false; }
  return true;
}
