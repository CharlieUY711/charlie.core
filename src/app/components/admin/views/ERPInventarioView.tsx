import React, { useState, useEffect, useCallback } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package, TrendingDown, BarChart2, Upload, Download, RefreshCw } from 'lucide-react';
import { ProductModal } from '../ProductModal';
import type { ProductFormData } from '../ProductModal';
import { supabase } from '../../../../utils/supabase/client';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface Props { onNavigate: (section: MainSection) => void; }

const ORANGE = '#FF6835';
const STORAGE = `https://${projectId}.supabase.co/storage/v1`;

// Sanitiza un string para usarlo como nombre de archivo seguro
function sanitizarNombre(s: string): string {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 60);
}

// Sube un archivo a Supabase Storage y devuelve la URL pÃºblica permanente
async function subirArchivo(file: File, nombre: string): Promise<string> {
  const ext = (file.name.split('.').pop() ?? 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const filename = `${Date.now()}-${sanitizarNombre(nombre)}.${ext}`;

  const uploadRes = await fetch(`${STORAGE}/object/productos/${filename}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    throw new Error(`Error subiendo archivo: ${err.message ?? uploadRes.status}`);
  }

  return `${STORAGE}/object/public/productos/${filename}`;
}

type ViewTab = 'articulos' | 'stock' | 'movimientos' | 'alertas';

interface Product {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precio_original?: number;
  departamento_id?: string;
  departamento?: string;
  imagen_principal?: string;
  imagenes?: string[];
  vendedor_id?: string;
  estado: string;
  badge?: string;
  created_at?: string;
}

export function ERPInventarioView({ onNavigate }: Props) {
  const [tab, setTab] = useState<ViewTab>('articulos');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('productos_market')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message || 'Error cargando productos');
      }
      
      setProducts(data || []);
    } catch (e: any) {
      console.error('Error al cargar productos:', e);
      setError(e.message ?? 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSave = async (data: ProductFormData) => {
    setSaving(true);
    setError(null);
    try {
      // Subir archivos a Storage usando el File real
      const imagenesSubidas = await Promise.all(
        (data.images ?? []).map(img =>
          img.file
            ? subirArchivo(img.file, data.name)
            : img.url.startsWith('blob:') ? Promise.reject(new Error('Imagen sin archivo')) : Promise.resolve(img.url)
        )
      );
      const videosSubidos = await Promise.all(
        (data.videos ?? []).map(vid =>
          vid.file
            ? subirArchivo(vid.file, data.name)
            : vid.url.startsWith('blob:') ? Promise.reject(new Error('Video sin archivo')) : Promise.resolve(vid.url)
        )
      );

      const body = {
        nombre: data.name,
        descripcion: data.description || null,
        precio_1: parseFloat(data.price) || 0,
        precio_original: data.discount ? parseFloat(data.price) : null,
        departamento: data.category || null,
        imagen_principal: imagenesSubidas[0] ?? null,
        imagenes: imagenesSubidas.length > 0 ? imagenesSubidas : null,
        videos: videosSubidos.length > 0 ? videosSubidos.map((url: string) => ({ url })) : null,
        estado: 'activo',
        badge: data.tags?.[0] ?? null,
        sku: data.sku || null,
        codigo_barras: data.barcode || null,
        marca: data.brand || null,
        costo: parseFloat(data.cost) || null,
        proveedor: data.supplier || null,
        impuesto: parseFloat(data.taxRate) || null,
        garantia: data.warranty || null,
        peso: parseFloat(data.weight) || null,
        alto: parseFloat(data.dimH) || null,
        ancho: parseFloat(data.dimW) || null,
        largo: parseFloat(data.dimL) || null,
        numero_serie: data.serialNumber || null,
        seo_titulo: data.seoTitle || null,
        seo_descripcion: data.seoDesc || null,
        atributos: Object.keys(data.mlAttributes || {}).length > 0 ? data.mlAttributes : null,
      };

      if (selectedProduct?.id) {
        // Editar
        const { error } = await supabase
          .from('productos_market')
          .update(body)
          .eq('id', selectedProduct.id);
        
        if (error) throw new Error(error.message || 'Error actualizando producto');
        showSuccess('Producto actualizado correctamente');
      } else {
        // Crear
        const { error } = await supabase
          .from('productos_market')
          .insert(body);
        
        if (error) throw new Error(error.message || 'Error creando producto');
        showSuccess('Producto creado correctamente');
      }

      setShowModal(false);
      setSelectedProduct(null);
      await fetchProducts();
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      const { error } = await supabase
        .from('productos_market')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message || 'Error eliminando producto');
      showSuccess('Producto eliminado');
      await fetchProducts();
    } catch (e: any) {
      setError(e.message ?? 'Error al eliminar');
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.departamento || p.departamento_id).filter(Boolean)))];

  const filtered = products.filter(p => {
    // Filtro por categoría/departamento
    if (catFilter !== 'all') {
      const dept = p.departamento || p.departamento_id;
      if (dept !== catFilter) return false;
    }
    // Filtro por búsqueda
    if (search && !p.nombre?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const inactivos = products.filter(p => p.estado !== 'activo');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Package}
        title="CatÃ¡logo de ArtÃ­culos"
        subtitle="GestiÃ³n de productos del marketplace"
        actions={[
          { label: 'Volver', onClick: () => onNavigate('gestion') },
          { label: '+ Nuevo ArtÃ­culo', primary: true, onClick: () => { setSelectedProduct(null); setShowModal(true); } },
        ]}
      />

      {/* Mensajes */}
      {error && (
        <div style={{ backgroundColor: 'var(--m-danger-bg)', color: 'var(--m-danger)', padding: '10px 24px', fontSize: '0.85rem', fontWeight: '600', borderBottom: '1px solid #FECACA' }}>
          âš  {error}
        </div>
      )}
      {successMsg && (
        <div style={{ backgroundColor: 'var(--m-success-bg)', color: 'var(--m-success)', padding: '10px 24px', fontSize: '0.85rem', fontWeight: '600', borderBottom: '1px solid #BBF7D0' }}>
          âœ“ {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div style={{ backgroundColor: 'var(--m-surface)', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', padding: '0 28px', alignItems: 'center' }}>
          {[
            { id: 'articulos' as ViewTab,   label: 'ðŸ“¦ ArtÃ­culos' },
            { id: 'alertas' as ViewTab,     label: `âš ï¸ Inactivos (${inactivos.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: '14px 18px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: tab === t.id ? ORANGE : 'var(--m-text-muted)', fontWeight: tab === t.id ? '700' : '500', fontSize: '0.875rem', borderBottom: tab === t.id ? `2px solid ${ORANGE}` : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={fetchProducts} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)', padding: '8px' }} title="Recargar">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--m-bg)' }}>
        <div style={{ padding: '24px 28px', maxWidth: '1300px' }}>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total ArtÃ­culos', value: products.length.toString(), Icon: Package, color: 'var(--m-text)' },
              { label: 'Activos',         value: products.filter(p => p.estado === 'activo').length.toString(), Icon: BarChart2, color: 'var(--m-success)' },
              { label: 'Inactivos',       value: inactivos.length.toString(), Icon: AlertTriangle, color: 'var(--m-danger)' },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: 'var(--m-surface)', border: `1px solid ${s.color}22`, borderRadius: '10px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--m-text-muted)' }}>{s.label}</span>
                  <s.Icon size={15} color={s.color} />
                </div>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* â”€â”€ ARTÃCULOS â”€â”€ */}
          {tab === 'articulos' && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                  <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} size={14} color="#9CA3AF" />
                  <input type="text" placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                  style={{ padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.82rem', outline: 'none', backgroundColor: 'var(--m-surface)' }}>
                  {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'Todas las categorÃ­as' : c}</option>)}
                </select>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--m-text-muted)' }}>
                  <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '12px' }}>Cargando productos...</p>
                </div>
              ) : products.length === 0 ? (
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '60px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                  <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>📦</p>
                  <p style={{ margin: '0 0 16px', fontWeight: '600', color: 'var(--m-text-secondary)' }}>No hay productos todavía</p>
                  <button onClick={() => { setSelectedProduct(null); setShowModal(true); }}
                    style={{ padding: '10px 20px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                    + Cargar primer producto
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '60px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                  <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>🔍</p>
                  <p style={{ margin: '0 0 8px', fontWeight: '600', color: 'var(--m-text-secondary)' }}>No se encontraron productos</p>
                  <p style={{ margin: '0 0 16px', fontSize: '0.875rem', color: 'var(--m-text-muted)' }}>
                    {search || catFilter !== 'all' 
                      ? 'Intenta ajustar los filtros de búsqueda o categoría'
                      : 'Hay productos pero no coinciden con los filtros aplicados'}
                  </p>
                  {(search || catFilter !== 'all') && (
                    <button onClick={() => { setSearch(''); setCatFilter('all'); }}
                      style={{ padding: '10px 20px', backgroundColor: 'var(--m-text-muted)', color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--m-surface)', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--m-surface-2)' }}>
                        {['Imagen', 'Nombre', 'CategorÃ­a', 'Precio', 'Estado', ''].map(h => (
                          <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: 'var(--m-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => (
                        <tr key={p.id} style={{ borderTop: '1px solid #F3F4F6', backgroundColor: i % 2 === 0 ? '#FFF' : 'var(--m-surface-2)' }}>
                          <td style={{ padding: '10px 14px' }}>
                            {p.imagen_principal
                              ? <img src={p.imagen_principal} alt={p.nombre} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '6px', border: '1px solid #E5E7EB' }} />
                              : <div style={{ width: 40, height: 40, borderRadius: '6px', backgroundColor: 'var(--m-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Package size={16} color="#D1D5DB" />
                                </div>
                            }
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontWeight: '600', color: 'var(--m-text)', fontSize: '0.875rem' }}>{p.nombre}</span>
                            {p.descripcion && <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--m-text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descripcion}</p>}
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--m-text-muted)', fontSize: '0.8rem' }}>{p.departamento ?? 'â€”'}</td>
                          <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.875rem' }}>${p.precio?.toFixed(2)}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700', backgroundColor: p.estado === 'activo' ? '#DCFCE7' : 'var(--m-surface-2)', color: p.estado === 'activo' ? '#15803D' : 'var(--m-text-muted)' }}>
                              {p.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button onClick={() => { setSelectedProduct(p); setShowModal(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-text-muted)' }} title="Editar"><Edit2 size={13} /></button>
                              <button onClick={() => handleDelete(p.id, p.nombre)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--m-danger)' }} title="Eliminar"><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* â”€â”€ INACTIVOS â”€â”€ */}
          {tab === 'alertas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {inactivos.length === 0 ? (
                <div style={{ backgroundColor: 'var(--m-surface)', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '50px', textAlign: 'center', color: 'var(--m-text-muted)' }}>
                  <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>âœ…</p>
                  <p style={{ margin: 0, fontWeight: '600' }}>Todos los productos estÃ¡n activos</p>
                </div>
              ) : inactivos.map(p => (
                <div key={p.id} style={{ backgroundColor: 'var(--m-warning-bg)', border: '1px solid #FDE68A', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <AlertTriangle size={20} color="#D97706" />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: '700', color: 'var(--m-text)', fontSize: '0.9rem' }}>{p.nombre}</p>
                    <p style={{ margin: 0, color: 'var(--m-text-muted)', fontSize: '0.78rem' }}>Estado: <strong style={{ color: 'var(--m-warning)' }}>{p.estado}</strong></p>
                  </div>
                  <button onClick={() => { setSelectedProduct(p); setShowModal(true); }}
                    style={{ padding: '8px 16px', backgroundColor: ORANGE, color: 'var(--m-surface)', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.78rem' }}>
                    Editar
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={selectedProduct ? {
            name: selectedProduct.nombre,
            description: selectedProduct.descripcion ?? '',
            price: String(selectedProduct.precio),
            category: selectedProduct.departamento ?? '',
            images: selectedProduct.imagen_principal
              ? [{ id: '1', name: 'imagen', url: selectedProduct.imagen_principal, type: 'image', size: '' }]
              : [],
            videos: [],
            sku: '', barcode: '', brand: '', stock: '', minStock: '',
            weight: '', dimH: '', dimW: '', dimL: '',
            tags: selectedProduct.badge ? [selectedProduct.badge] : [],
            discount: '', serialNumber: '', cost: '', supplier: '',
            taxRate: '', warranty: '', origin: '', material: '',
            color: '', size: '', seoTitle: '', seoDesc: '',
            sync: { store: true, ml: false, instagram: false, whatsapp: false },
            syncStatus: { store: 'pending', ml: 'disabled', instagram: 'disabled', whatsapp: 'disabled' },
            mlAttributes: {},
          } : null}
          onClose={() => { setShowModal(false); setSelectedProduct(null); }}
          onSave={handleSave}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
