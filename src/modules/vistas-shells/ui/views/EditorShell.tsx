/**
 * EditorShell.tsx
 * Charlie Platform — Módulo Vistas y Shells · Fase VS-D
 *
 * Panel de edición de props de un ShellEntry.
 * Usa DrawerShell como contenedor. Preview en tiempo real via ShellPreview.
 * Persiste ediciones via saveEdit() de vistasShellsApi.
 *
 * C5: Zero colores hardcodeados — solo var(--m-*)
 * C8: No contiene supabase.from() — delega en vistasShellsApi
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Sliders } from 'lucide-react';
import type { ShellEntry, PropDef } from '../../types';
import { saveEdit } from '../../service/vistasShellsApi';
import { ShellPreview } from './ShellPreview';

// Importamos DrawerShell desde la capa de shells
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

/** Convierte PropDef[] en FieldDef[] para DrawerShell */
function propsToFields(props: PropDef[]): FieldDef[] {
  return props.map(prop => {
    const base: FieldDef = {
      id:          prop.id,
      label:       prop.label,
      hint:        prop.descripcion,
      placeholder: prop.valorDefault,
    };

    switch (prop.tipo) {
      case 'color':
        return { ...base, type: 'text', placeholder: prop.valorDefault };
      case 'spacing':
        return { ...base, type: 'text', placeholder: prop.valorDefault };
      case 'radius':
        return { ...base, type: 'text', placeholder: prop.valorDefault };
      case 'font':
        return { ...base, type: 'text', placeholder: prop.valorDefault };
      case 'boolean':
        return { ...base, type: 'toggle' };
      case 'text':
        return { ...base, type: 'text' };
      default:
        return { ...base, type: 'text' };
    }
  });
}

/** Construye initialData desde los valorDefault de las props */
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
  // Construimos un ShellEntry con los valores editados aplicados
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
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Cuando cambia el shell, reseteamos formData
  React.useEffect(() => {
    if (shell) setFormData(buildInitialData(shell.props));
  }, [shell?.id]);

  // ── Sheets para DrawerShell ─────────────────────────────────────────────────

  const sheets: SheetDef[] = useMemo(() => {
    if (!shell) return [];

    // Sheet 1: Preview en tiempo real (campo custom)
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

    // Sheet 2: Edición de props agrupadas por tipo
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

    // Guardamos solo las props que cambiaron respecto al valorDefault
    const edits = shell.props.filter(p => {
      const nuevo = data[p.id] as string | undefined;
      return nuevo && nuevo !== p.valorDefault;
    });

    await Promise.all(
      edits.map(p =>
        saveEdit({
          shellId:  shell.id,
          tenantId: 'charlie',
          propId:   p.id,
          valor:    data[p.id] as string,
        })
      )
    );

    onSaved?.(shell.id);
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
      initialData={buildInitialData(shell.props)}
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
