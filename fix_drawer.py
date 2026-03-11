import sys

content = """\
/**
 * DrawerAuditoria.tsx
 */
import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, Circle, Plus, Trash2, Save } from 'lucide-react';
import { useAuditoria, type CriterioStatus } from '../../../hooks/useAuditoria';

export interface CriterioInicial {
  id:      string;
  label:   string;
  status:  CriterioStatus;
  detalle: string;
  auto:    boolean;
}

export interface ModuloParaAuditar {
  section:             string;
  nombre:              string;
  criteriosIniciales?: CriterioInicial[];
}

const STATUS_COLORS: Record<CriterioStatus, string> = {
  ok: '#10B981', fail: '#EF4444', partial: '#F59E0B', unknown: '#9CA3AF',
};
const STATUS_LABELS: Record<CriterioStatus, string> = {
  ok: 'OK', fail: 'Falla', partial: 'Parcial', unknown: 'Sin auditar',
};

function StatusIcon({ status }: { status: CriterioStatus }) {
  const color = STATUS_COLORS[status];
  if (status === 'ok')      return <CheckCircle2 size={16} color={color} />;
  if (status === 'fail')    return <XCircle      size={16} color={color} />;
  if (status === 'partial') return <AlertCircle  size={16} color={color} />;
  return <Circle size={16} color={color} />;
}

interface Props {
  modulo:      ModuloParaAuditar | null;
  onClose:     () => void;
  onGuardado?: (moduloId: string, score: number) => void;
}

export function DrawerAuditoria({ modulo, onClose, onGuardado }: Props) {
  const { criterios: criteriosDB, pasos, loading, saveCriterio, addPaso, updatePaso, deletePaso } = useAuditoria(modulo?.section ?? null);
  const [criteriosFS, setCriteriosFS]   = useState<CriterioInicial[]>([]);
  const [auditando, setAuditando]       = useState(false);
  const [localStatus, setLocalStatus]   = useState<Record<string, CriterioStatus>>({});
  const [localDetalle, setLocalDetalle] = useState<Record<string, string>>({});
  const [guardando, setGuardando]       = useState(false);
  const [guardado, setGuardado]         = useState(false);
  const [nuevoPaso, setNuevoPaso]       = useState('');

  React.useEffect(() => {
    if (!modulo) return;
    setCriteriosFS([]);
    setLocalStatus({});
    setLocalDetalle({});
    setGuardado(false);
    setAuditando(true);
    fetch('/api/audit/' + modulo.section)
      .then(r => r.json())
      .then(data => { if (data.criterios) setCriteriosFS(data.criterios); })
      .catch(() => {})
      .finally(() => setAuditando(false));
  }, [modulo?.section]);

  if (!modulo) return null;

  const criterioIds = (criteriosFS.length > 0 ? criteriosFS : modulo.criteriosIniciales ?? []).map(c => c.id);

  const getStatus = (cid: string): CriterioStatus => {
    if (localStatus[cid]) return localStatus[cid];
    const fromDB = criteriosDB.find(c => c.criterio_id === cid);
    if (fromDB) return fromDB.status;
    const fs = criteriosFS.find(c => c.id === cid);
    if (fs) return fs.status;
    return modulo.criteriosIniciales?.find(c => c.id === cid)?.status ?? 'unknown';
  };

  const getDetalle = (cid: string): string => {
    if (localDetalle[cid] !== undefined) return localDetalle[cid];
    const fromDB = criteriosDB.find(c => c.criterio_id === cid);
    if (fromDB) return fromDB.detalle ?? '';
    const fs = criteriosFS.find(c => c.id === cid);
    if (fs) return fs.detalle;
    return modulo.criteriosIniciales?.find(c => c.id === cid)?.detalle ?? '';
  };

  const isAuto   = (cid: string) => (criteriosFS.length > 0 ? criteriosFS : modulo.criteriosIniciales ?? []).find(c => c.id === cid)?.auto ?? false;
  const getLabel = (cid: string) => (criteriosFS.length > 0 ? criteriosFS : modulo.criteriosIniciales ?? []).find(c => c.id === cid)?.label ?? cid;

  const cycleStatus = (cid: string) => {
    if (isAuto(cid)) return;
    const cycle: CriterioStatus[] = ['unknown', 'ok', 'partial', 'fail'];
    const next = cycle[(cycle.indexOf(getStatus(cid)) + 1) % cycle.length];
    setLocalStatus(p => ({ ...p, [cid]: next }));
    setGuardado(false);
  };

  const guardarAuditoria = async () => {
    setGuardando(true);
    for (const cid of criterioIds) {
      await saveCriterio(cid, getStatus(cid), getDetalle(cid));
    }
    setGuardando(false);
    setGuardado(true);
    const nuevoScore = criterioIds.filter(cid => getStatus(cid) === 'ok').length;
    onGuardado?.(modulo.section, nuevoScore);
    setLocalStatus({});
    setLocalDetalle({});
  };

  const score      = criterioIds.filter(cid => getStatus(cid) === 'ok').length;
  const hayCambios = Object.keys(localStatus).length > 0 || Object.keys(localDetalle).length > 0;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 100, backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', backgroundColor: '#fff', zIndex: 101, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'linear-gradient(135deg, #FF6835 0%, #ff8c42 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: 800 }}>{modulo.nombre.charAt(0).toUpperCase()}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#111' }}>{modulo.nombre}</div>
            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>{modulo.section}</div>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: score === 8 ? '#10B981' : score >= 5 ? '#3B82F6' : score >= 3 ? '#F59E0B' : '#EF4444' }}>
            {auditando ? '...' : score + '/8'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={20} color="#9CA3AF" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {(loading || auditando) && <div style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: 16 }}>{auditando ? 'Analizando...' : 'Cargando...'}</div>}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Auditoría C1-C8</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {criterioIds.map(cid => {
                const status  = getStatus(cid);
                const detalle = getDetalle(cid);
                const color   = STATUS_COLORS[status];
                const auto    = isAuto(cid);
                return (
                  <div key={cid} style={{ borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: auto ? '#F9FAFB' : '#FAFAFA', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', cursor: auto ? 'default' : 'pointer' }} onClick={() => cycleStatus(cid)}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: auto ? '#EFF6FF' : '#FFF7ED', color: auto ? '#1D4ED8' : '#92400E', flexShrink: 0 }}>{cid}</span>
                      <span style={{ flex: 1, fontSize: '13px', color: '#374151' }}>{getLabel(cid)}</span>
                      {auto && <span style={{ fontSize: '10px', color: '#9CA3AF', marginRight: 4 }}>auto</span>}
                      <StatusIcon status={status} />
                      <span style={{ fontSize: '11px', color, fontWeight: 600, minWidth: '60px', textAlign: 'right' }}>{STATUS_LABELS[status]}</span>
                    </div>
                    {detalle && <div style={{ padding: '0 12px 8px 36px', fontSize: '11px', color: '#6B7280' }}>{detalle}</div>}
                    {!auto && (
                      <div style={{ padding: '0 12px 8px 36px' }}>
                        <input value={localDetalle[cid] ?? detalle} onChange={e => { setLocalDetalle(p => ({ ...p, [cid]: e.target.value })); setGuardado(false); }} placeholder="Observacion..." style={{ width: '100%', fontSize: '11px', padding: '4px 8px', border: '1px solid #E5E7EB', borderRadius: '5px', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <button onClick={guardarAuditoria} disabled={guardando} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: guardado && !hayCambios ? '#10B981' : '#FF6835', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Save size={15} />
            {guardando ? 'Guardando...' : guardado && !hayCambios ? 'Guardado' : 'Guardar auditoria'}
          </button>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Proximos pasos</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input value={nuevoPaso} onChange={e => setNuevoPaso(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && nuevoPaso.trim()) { addPaso(nuevoPaso.trim()); setNuevoPaso(''); }}} placeholder="Agregar paso..." style={{ flex: 1, fontSize: '13px', padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', outline: 'none' }} />
              <button onClick={() => { if (nuevoPaso.trim()) { addPaso(nuevoPaso.trim()); setNuevoPaso(''); }}} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#FF6835', color: '#fff', cursor: 'pointer', fontSize: '13px' }}>+</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pasos.length === 0 && <div style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>Sin pasos definidos</div>}
              {pasos.map(paso => (
                <div key={paso.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FAFAFA' }}>
                  <select value={paso.estado} onChange={e => updatePaso(paso.id, e.target.value as any)} style={{ fontSize: '11px', padding: '3px 6px', borderRadius: '5px', border: '1px solid #E5E7EB', backgroundColor: '#fff', color: paso.estado === 'completado' ? '#10B981' : paso.estado === 'en_progreso' ? '#3B82F6' : '#6B7280' }}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="completado">Completado</option>
                  </select>
                  <span style={{ flex: 1, fontSize: '13px', color: '#374151', textDecoration: paso.estado === 'completado' ? 'line-through' : 'none' }}>{paso.descripcion}</span>
                  <button onClick={() => deletePaso(paso.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}><Trash2 size={14} color="#9CA3AF" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
"""

with open(r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\DrawerAuditoria.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
