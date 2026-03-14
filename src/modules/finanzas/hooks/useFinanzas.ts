'use client';
// ============================================================
// HOOKS — Módulo Finanzas
// ============================================================
import { useState, useEffect, useCallback, useTransition } from 'react';
import {
  getIngresos,
  createIngreso,
  updateIngreso,
  deleteIngreso,
  confirmarIngreso,
  getEgresos,
  createEgreso,
  updateEgreso,
  getResumenFinanciero,
  getFlujoCaja,
  getInstrumentos,
  getSugerenciasConciliacion,
  conciliarManual,
  getProyeccionCalculada,
  getAuditoria,
} from '../actions/finanzas.actions';
import type {
  Ingreso,
  Egreso,
  ResumenFinanciero,
  FlujoCajaDia,
  InstrumentoFinanciero,
  ConciliacionSugerida,
  FiltrosFinanzas,
  PaginatedResult,
  ActionResult,
} from '../types/finanzas.types';

// ─── Hook genérico para Server Actions ───────────────────────

function useAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionResult<TOutput>>
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TOutput | undefined>();

  const execute = useCallback(
    async (input: TInput): Promise<ActionResult<TOutput>> => {
      setError(null);
      return new Promise((resolve) => {
        startTransition(async () => {
          const result = await action(input);
          if (result.success) {
            setData(result.data);
          } else {
            setError(result.error ?? 'Error desconocido');
          }
          resolve(result);
        });
      });
    },
    [action]
  );

  return { execute, isPending, error, data };
}

// ─── useIngresos ─────────────────────────────────────────────

export function useIngresos(comision_id: string) {
  const [filtros, setFiltros] = useState<FiltrosFinanzas>({
    comision_id,
    page: 1,
    per_page: 20,
    order_dir: 'desc',
  });
  const [resultado, setResultado] = useState<PaginatedResult<Ingreso> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (f?: Partial<FiltrosFinanzas>) => {
    setIsLoading(true);
    setError(null);
    try {
      const filtrosActuales = { ...filtros, comision_id, ...f };
      const result = await getIngresos(filtrosActuales);
      if (result.success && result.data) {
        setResultado(result.data);
        if (f) setFiltros(filtrosActuales);
      } else {
        setError(result.error ?? 'Error al cargar ingresos');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filtros, comision_id]);

  useEffect(() => {
    cargar();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const { execute: crear, isPending: creando } = useAction(createIngreso);
  const { execute: editar, isPending: editando } = useAction(
    ({ id, data }: { id: string; data: unknown }) => updateIngreso(id, data)
  );

  const eliminar = useCallback(async (id: string) => {
    const result = await deleteIngreso(id);
    if (result.success) await cargar();
    return result;
  }, [cargar]);

  const confirmar = useCallback(async (id: string, fecha: string) => {
    const result = await confirmarIngreso(id, fecha);
    if (result.success) await cargar();
    return result;
  }, [cargar]);

  const actualizarFiltros = useCallback((nuevosFiltros: Partial<FiltrosFinanzas>) => {
    cargar({ ...nuevosFiltros, page: 1 });
  }, [cargar]);

  const cambiarPagina = useCallback((page: number) => {
    cargar({ page });
  }, [cargar]);

  return {
    ingresos: resultado?.data ?? [],
    total: resultado?.count ?? 0,
    totalPaginas: resultado?.total_pages ?? 0,
    paginaActual: filtros.page ?? 1,
    filtros,
    isLoading,
    error,
    creando,
    editando,
    cargar,
    crear,
    editar,
    eliminar,
    confirmar,
    actualizarFiltros,
    cambiarPagina,
    resetFiltros: () => cargar({ page: 1, estado: undefined, categoria_id: undefined, busqueda: undefined }),
  };
}

// ─── useEgresos ───────────────────────────────────────────────

export function useEgresos(comision_id: string) {
  const [filtros, setFiltros] = useState<FiltrosFinanzas>({ comision_id, page: 1, per_page: 20, order_dir: 'desc' });
  const [resultado, setResultado] = useState<PaginatedResult<Egreso> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (f?: Partial<FiltrosFinanzas>) => {
    setIsLoading(true);
    setError(null);
    try {
      const filtrosActuales = { ...filtros, comision_id, ...f };
      const result = await getEgresos(filtrosActuales);
      if (result.success && result.data) {
        setResultado(result.data);
        if (f) setFiltros(filtrosActuales);
      } else {
        setError(result.error ?? 'Error al cargar egresos');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filtros, comision_id]);

  useEffect(() => { cargar(); }, []);  // eslint-disable-line

  const { execute: crear, isPending: creando } = useAction(createEgreso);
  const { execute: editar, isPending: editando } = useAction(
    ({ id, data }: { id: string; data: unknown }) => updateEgreso(id, data)
  );

  return {
    egresos: resultado?.data ?? [],
    total: resultado?.count ?? 0,
    totalPaginas: resultado?.total_pages ?? 0,
    paginaActual: filtros.page ?? 1,
    filtros,
    isLoading,
    error,
    creando,
    editando,
    cargar,
    crear,
    editar,
    actualizarFiltros: (f: Partial<FiltrosFinanzas>) => cargar({ ...f, page: 1 }),
  };
}

// ─── useResumenFinanciero ─────────────────────────────────────

export function useResumenFinanciero(comision_id: string) {
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getResumenFinanciero(comision_id);
      if (result.success) setResumen(result.data ?? null);
      else setError(result.error ?? 'Error al cargar resumen');
    } finally {
      setIsLoading(false);
    }
  }, [comision_id]);

  useEffect(() => { cargar(); }, [cargar]);

  return { resumen, isLoading, error, refresh: cargar };
}

// ─── useFlujoCaja ─────────────────────────────────────────────

export function useFlujoCaja(
  comision_id: string,
  fechaDesde?: string,
  fechaHasta?: string
) {
  const [flujo, setFlujo] = useState<FlujoCajaDia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (desde?: string, hasta?: string) => {
    setIsLoading(true);
    try {
      const result = await getFlujoCaja(comision_id, desde ?? fechaDesde, hasta ?? fechaHasta);
      if (result.success) setFlujo(result.data ?? []);
      else setError(result.error ?? 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [comision_id, fechaDesde, fechaHasta]);

  useEffect(() => { cargar(); }, [cargar]);

  return { flujo, isLoading, error, cargar };
}

// ─── useInstrumentos ─────────────────────────────────────────

export function useInstrumentos(comision_id: string) {
  const [instrumentos, setInstrumentos] = useState<InstrumentoFinanciero[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getInstrumentos(comision_id);
      if (result.success) setInstrumentos(result.data ?? []);
      else setError(result.error ?? 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [comision_id]);

  useEffect(() => { cargar(); }, [cargar]);

  return { instrumentos, isLoading, error, refresh: cargar };
}

// ─── useConciliacion ─────────────────────────────────────────

export function useConciliacion(instrumento_id: string) {
  const [sugerencias, setSugerencias] = useState<ConciliacionSugerida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conciliando, setConciliando] = useState(false);

  const cargarSugerencias = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getSugerenciasConciliacion(instrumento_id);
      if (result.success) setSugerencias(result.data ?? []);
      else setError(result.error ?? 'Error');
    } finally {
      setIsLoading(false);
    }
  }, [instrumento_id]);

  useEffect(() => { cargarSugerencias(); }, [cargarSugerencias]);

  const conciliar = useCallback(async (data: {
    movimiento_ext_id: string;
    ingreso_id?: string;
    egreso_id?: string;
    notas?: string;
  }) => {
    setConciliando(true);
    try {
      const result = await conciliarManual(data);
      if (result.success) {
        await cargarSugerencias();
      }
      return result;
    } finally {
      setConciliando(false);
    }
  }, [cargarSugerencias]);

  const ignorar = useCallback((id: string) => {
    setSugerencias((prev) => prev.filter((s) => s.movimiento_ext_id !== id));
  }, []);

  return {
    sugerencias,
    isLoading,
    error,
    conciliando,
    conciliar,
    ignorar,
    refresh: cargarSugerencias,
  };
}

// ─── useProyecciones ─────────────────────────────────────────

export function useProyecciones(comision_id: string, meses = 3) {
  const [proyecciones, setProyecciones] = useState<
    Array<{ mes: string; monto_proyectado: number; confianza: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getProyeccionCalculada(comision_id, meses).then((result) => {
      if (result.success) setProyecciones(result.data ?? []);
      setIsLoading(false);
    });
  }, [comision_id, meses]);

  return { proyecciones, isLoading };
}

// ─── useAuditoria ─────────────────────────────────────────────

export function useAuditoria(comision_id: string, tabla?: string) {
  const [registros, setRegistros] = useState<unknown[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const cargar = useCallback(async (p = 1) => {
    setIsLoading(true);
    try {
      const result = await getAuditoria(comision_id, tabla, p);
      if (result.success && result.data) {
        setRegistros((result.data as { data: unknown[]; count: number }).data);
        setTotal((result.data as { data: unknown[]; count: number }).count);
        setPage(p);
      }
    } finally {
      setIsLoading(false);
    }
  }, [comision_id, tabla]);

  useEffect(() => { cargar(); }, [cargar]);

  return { registros, total, page, isLoading, cambiarPagina: cargar };
}
