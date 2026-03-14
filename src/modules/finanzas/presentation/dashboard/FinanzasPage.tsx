// ============================================================
// PÁGINA — Dashboard de Finanzas
// Archivo: src/app/(protected)/finanzas/page.tsx
// ============================================================
import { Suspense } from 'react';
import { createServerClient } from '@/src/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getResumenFinanciero, getFlujoCaja, getProyeccionCalculada } from '@/src/modules/finanzas/actions/finanzas.actions';
import { FinanzasDashboard } from '@/src/modules/finanzas/presentation/dashboard/FinanzasDashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FinanzasPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Obtener comisión del usuario
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('comision_id, role')
    .eq('id', user.id)
    .single();

  if (!profile?.comision_id) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No estás asignado a ninguna comisión con acceso a finanzas.
      </div>
    );
  }

  const comision_id = profile.comision_id;

  // Fetch en paralelo para máximo rendimiento
  const [resumenResult, flujoResult, proyResult] = await Promise.all([
    getResumenFinanciero(comision_id),
    getFlujoCaja(comision_id),
    getProyeccionCalculada(comision_id, 3),
  ]);

  if (!resumenResult.success || !resumenResult.data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-sm text-red-600">
        Error al cargar el resumen financiero: {resumenResult.error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Dashboard Financiero</h1>
          <p className="text-sm text-slate-500">
            {resumenResult.data.comision_nombre}
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Actualizado {new Date().toLocaleDateString('es-AR', { dateStyle: 'long' })}
        </p>
      </div>

      {/* Dashboard principal */}
      <Suspense fallback={<DashboardSkeleton />}>
        <FinanzasDashboard
          comision_id={comision_id}
          resumen={resumenResult.data}
          flujoCaja={flujoResult.data ?? []}
        />
      </Suspense>

      {/* Proyecciones */}
      {proyResult.success && proyResult.data && proyResult.data.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Proyecciones</h2>
          <div className="space-y-3">
            {proyResult.data.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">
                  {new Date(p.mes).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-800">
                    ${p.monto_proyectado.toLocaleString('es-AR')}
                  </span>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                    {Math.round(p.confianza * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

// ============================================================
// LAYOUT del módulo
// Archivo: src/app/(protected)/finanzas/layout.tsx
// ============================================================
export function FinanzasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      {/* Sidebar interno del módulo */}
      <aside className="w-52 shrink-0 border-r border-slate-200 bg-white">
        <nav className="p-4 space-y-1">
          {[
            { href: '/finanzas',                label: 'Dashboard',     icono: '◻' },
            { href: '/finanzas/ingresos',        label: 'Ingresos',      icono: '↑' },
            { href: '/finanzas/egresos',         label: 'Egresos',       icono: '↓' },
            { href: '/finanzas/flujo',           label: 'Flujo de Caja', icono: '≈' },
            { href: '/finanzas/instrumentos',    label: 'Instrumentos',  icono: '◈' },
            { href: '/finanzas/reportes',        label: 'Reportes',      icono: '≡' },
            { href: '/finanzas/auditoria',       label: 'Auditoría',     icono: '✓' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <span className="text-base opacity-60">{item.icono}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
