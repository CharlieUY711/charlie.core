// =============================================================================
// vistasShellsApi.ts
// Módulo: vistas-shells · Fase VS-B
// C3: toda la lógica Supabase centralizada aquí
// C8: ningún supabase.from() fuera de este archivo
// =============================================================================

import { supabase } from '@/utils/supabase/client';
import type { ShellEntry, ShellEdit } from '../types';

const TENANT_ID = 'charlie';

// ─── Mappers snake_case ↔ camelCase ──────────────────────────────────────────

function rowToShellEntry(row: Record<string, unknown>): ShellEntry {
  return {
    id:          (row.shell_id ?? row.id) as string,
    nombre:      row.nombre as string,
    tipo:        row.tipo as ShellEntry['tipo'],
    descripcion: row.descripcion as string,
    archivo:     row.archivo as string,
    props:       (row.props ?? []) as ShellEntry['props'],
    variantes:   (row.variantes ?? []) as ShellEntry['variantes'],
    isReal:      row.is_real as boolean,
    createdAt:   row.created_at as string,
    updatedAt:   row.updated_at as string,
  };
}

function shellEntryToRow(entry: Omit<ShellEntry, 'id' | 'createdAt' | 'updatedAt'> & { tenantId?: string }) {
  return {
    tenant_id:   entry.tenantId ?? TENANT_ID,
    shell_id:    entry.id,
    nombre:      entry.nombre,
    tipo:        entry.tipo,
    descripcion: entry.descripcion,
    archivo:     entry.archivo,
    props:       entry.props,
    variantes:   entry.variantes,
    is_real:     entry.isReal,
    updated_at:  new Date().toISOString(),
  };
}

function rowToShellEdit(row: Record<string, unknown>): ShellEdit {
  return {
    id:          (row.shell_id ?? row.id) as string,
    shellId:   row.shell_id as string,
    tenantId:  row.tenant_id as string,
    propId:    row.prop_id as string,
    valor:     row.valor as string,
    createdAt: row.created_at as string,
  };
}

// ─── shell_entries ────────────────────────────────────────────────────────────

export async function getShells(tenantId = TENANT_ID): Promise<ShellEntry[]> {
  const { data, error } = await supabase
    .from('shell_entries')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`getShells: ${error.message}`);
  return (data ?? []).map(rowToShellEntry);
}

export async function getShellById(
  shellId: string,
  tenantId = TENANT_ID
): Promise<ShellEntry | null> {
  const { data, error } = await supabase
    .from('shell_entries')
    .select('*')
    .eq('shell_id', shellId)
    .eq('tenant_id', tenantId)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(`getShellById: ${error.message}`);
  return data ? rowToShellEntry(data) : null;
}

export async function upsertShell(
  entry: Omit<ShellEntry, 'createdAt' | 'updatedAt'>
): Promise<ShellEntry> {
  const { data, error } = await supabase
    .from('shell_entries')
    .upsert(shellEntryToRow(entry))
    .select()
    .single();

  if (error) throw new Error(`upsertShell: ${error.message}`);
  return rowToShellEntry(data);
}

export async function deleteShell(
  shellId: string,
  tenantId = TENANT_ID
): Promise<void> {
  const { error } = await supabase
    .from('shell_entries')
    .delete()
    .eq('shell_id', shellId)
    .eq('tenant_id', tenantId);

  if (error) throw new Error(`deleteShell: ${error.message}`);
}

// ─── shell_edits ──────────────────────────────────────────────────────────────

export async function saveEdit(
  edit: Omit<ShellEdit, 'id' | 'createdAt'>
): Promise<ShellEdit> {
  const { data, error } = await supabase
    .from('shell_edits')
    .insert({
      tenant_id: edit.tenantId,
      shell_id:  edit.shellId,
      prop_id:   edit.propId,
      valor:     edit.valor,
    })
    .select()
    .single();

  if (error) throw new Error(`saveEdit: ${error.message}`);
  return rowToShellEdit(data);
}

export async function getEdits(
  shellId: string,
  tenantId = TENANT_ID
): Promise<ShellEdit[]> {
  const { data, error } = await supabase
    .from('shell_edits')
    .select('*')
    .eq('shell_id', shellId)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getEdits: ${error.message}`);
  return (data ?? []).map(rowToShellEdit);
}

