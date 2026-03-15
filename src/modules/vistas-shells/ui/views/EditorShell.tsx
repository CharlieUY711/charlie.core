/**
 * EditorShell.tsx
 * Charlie Platform — Módulo Vistas y Shells · Fase VS-D
 *
 * Panel de edición de props de un ShellEntry.
 * Usa DrawerShell como contenedor. Preview en tiempo real via ShellPreview.
 * Persiste ediciones via saveEdit() de vistasShellsApi.
 * Al abrir carga los últimos edits guardados via getEdits().
 *
 * C5: Zero colores hardcodeados — solo var(--m-*)
 * C8: No contiene supabase.from() — delega en vistasShellsApi
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import type { ShellEntry, PropDef } from '../../types';
import { saveEdit, getEdits } from '../../service/vistasShellsApi';
import { ShellPreview } from './ShellPreview';

import { DrawerShell } from '../../../../app/components/shells/DrawerShell';
import type { SheetDef, FieldDef } from '../../../../app/components/shells/DrawerShell.types';

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface EditorShellProps {
  shell:    ShellEntry | null;
  open:     boolean;
  onClose:  () => void;
  onSaved?: (shellId: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function propsToFields(props: PropDef[]): FieldDef[] {
  return props.map(prop => {
    const base: FieldDef = {
      id:          prop.id,
      label:       prop.label,
      hint:        prop.descripcion,
      placeholder: prop.valorDefault,
    };
    switch (prop.tipo) {
      case 'boolean': return { ...base, type: 'toggle' };
      default:        return { ...base, type: 'text' };
    }
  });
}

function buildInitialData(props: PropDef[]): Record<string, unknown> {
  return Object.fromEntries(props.map(p => [p.id, p.valorDefault]));
}

// ── Subcomponente: preview en tiempo real ─────────────────────────────────────

function PreviewLive({
  shell,
  formData,
}: {
  shell:    ShellEntry;
  formData: Record<string, unknown>;
}) {
  const shellEditado: ShellEntry = useMemo(() => ({
    ...shell,
    props: shell.props.map(p => ({
      ...p,
      valorDefault: (formData[p.id] as string) || p.valorDefault,
    })),
  }), [shell, formData]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 'var(--m-space-2)' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--m-color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
        Preview en tiempo real
      </span>
      <ShellPreview shell={shellEditado} height={180} />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function EditorShell({ shell, open, onClose, onSaved }: EditorShellProps) {
  const [formData,  setFormData]  = useState<Record<string, unknown>>({});
  const [loading,   setLoading]   = useState(false);

  // ── Cargar edits previos al abrir ───────────────────────────────────────────

  useEffect(() => {
    if (!shell || !open) return;

    const base = buildInitialData(shell.props);

    // Intentar cargar edits guardados
    const shellId = shell.shellId ?? shell.id;
    setLoading(true);
    getEdits(shellId)
      .then(edits => {
        // Aplicar edits sobre los valores default
        // Si hay múltiples edits para la misma prop, el más reciente gana
        const merged = { ...base };
        // getEdits devuelve orden desc (más reciente primero)
        // iteramos al revés para que el más reciente sobreescriba
        const editsSorted = [...edits].reverse();
        for (const edit of editsSorted) {
          merged[edit.propId] = edit.valor;
        }
        setFormData(merged);
      })
      .catch(() => {
        // Si falla, usamos los valores default
        setFormData(base);
      })
      .finally(() => setLoading(false));
  }, [shell?.id, open]);

  // ── Sheets para DrawerShell ─────────────────────────────────────────────────

  const sheets: SheetDef[] = useMemo(() => {
    if (!shell) return [];

    const previewSheet: SheetDef = {
      id:       'preview',
      title:    'Preview',
      subtitle: 'Vista previa con los valores actuales',
      fields: [
        {
          id:   'preview-live',
          type: 'custom',
          renderComponent: () => (
            <PreviewLive shell={shell} formData={formData} />
          ),
        },
      ],
    };

    const tiposPresentes = [...new Set(shell.props.map(p => p.tipo))];
    const propSheets: SheetDef[] = tiposPresentes.map(tipo => ({
      id:       `props-${tipo}`,
      title:    tipo.charAt(0).toUpperCase() + tipo.slice(1),
      subtitle: `Propiedades de tipo ${tipo}`,
      fields:   propsToFields(shell.props.filter(p => p.tipo === tipo)),
    }));

    return [previewSheet, ...propSheets];
  }, [shell, formData]);

  // ── Guardar ─────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async (data: Record<string, unknown>) => {
    if (!shell) return;

    const shellId = shell.shellId ?? shell.id;

    // Guardar todas las props que tienen valor (no solo las que cambiaron)
    const edits = shell.props.filter(p => {
      const valor = data[p.id] as string | undefined;
      return valor !== undefined && valor !== '';
    });

    await Promise.all(
      edits.map(p =>
        saveEdit({
          shellId,
          tenantId: 'charlie',
          propId:   p.id,
          valor:    data[p.id] as string,
        })
      )
    );

    onSaved?.(shellId);
  }, [shell, onSaved]);

  if (!shell) return null;

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title={shell.nombre}
      icon={Sliders}
      sheets={sheets}
      initialData={formData}
      loading={loading}
      labels={{
        save:    'Guardar cambios',
        saving:  'Guardando...',
        cancel:  'Cancelar',
        prev:    'Anterior',
        next:    'Siguiente',
        pageOf:  'de',
      }}
    />
  );
}
