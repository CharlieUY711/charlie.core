/**
 * useModuleSubtitulo.ts
 * Charlie Platform — Hook para setear el subtítulo dinámico en la TopBarShell
 *
 * USO:
 *   useModuleSubtitulo('Checklist: 11 módulos · 14/88 · 16%')
 *
 * Se actualiza automáticamente cuando cambia el subtítulo.
 * Limpia el subtítulo al desmontar el módulo.
 */
import { useEffect } from 'react';
import { useShell } from '../context/ShellContext';

export function useModuleSubtitulo(subtitulo: string | null) {
  const { setSubtitulo } = useShell();

  useEffect(() => {
    setSubtitulo(subtitulo);
    return () => setSubtitulo(null);
  }, [subtitulo]);
}
