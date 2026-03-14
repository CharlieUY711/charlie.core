'use client';
interface ProyeccionData {
  mes: string;
  monto_proyectado: number;
  confianza: number;
}
export function ProyeccionesWidget({ proyecciones }: { proyecciones: ProyeccionData[] }) {
  const max = Math.max(...proyecciones.map((p) => p.monto_proyectado), 1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Proyecciones de Ingresos</h2>
        <span className="text-xs text-slate-400">Próximos 3 meses</span>
      </div>
      <div className="space-y-3">
        {proyecciones.map((p, i) => {
          const pct = Math.round((p.monto_proyectado / max) * 100);
          return (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-600">
                  {new Date(p.mes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">
                    ${p.monto_proyectado.toLocaleString('es-AR')}
                  </span>
                  <span className="text-slate-400">{Math.round(p.confianza * 100)}% conf.</span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
