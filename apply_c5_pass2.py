import re, os

# Segunda pasada — colores sin mapear agrupados por categoria
COLOR_MAP_2 = {
    # Tailwind green variantes
    '#16A34A': 'var(--m-success)', '#15803D': 'var(--m-success)',
    '#16a34a': 'var(--m-success)', '#15803d': 'var(--m-success)',
    '#22C55E': 'var(--m-success)', '#4ADE80': 'var(--m-success)',
    '#86EFAC': 'var(--m-success-bg)', '#86efac': 'var(--m-success-bg)',
    '#A7F3D0': 'var(--m-success-bg)', '#6EE7B7': 'var(--m-success-bg)',
    '#DCFCE7': 'var(--m-success-bg)', '#dcfce7': 'var(--m-success-bg)',
    '#BBF7D0': 'var(--m-success-bg)', '#F0FDF4': 'var(--m-success-bg)',
    '#ECFDF5': 'var(--m-success-bg)', '#D1FAE5': 'var(--m-success-bg)',
    '#F0FFF4': 'var(--m-success-bg)', '#ECFDF5': 'var(--m-success-bg)',
    '#047857': 'var(--m-success-text)', '#065F46': 'var(--m-success-text)',
    '#14B8A6': 'var(--m-success)', '#0D9488': 'var(--m-success)',
    '#0d9488': 'var(--m-success)', '#0F766E': 'var(--m-success)',
    '#128C7E': 'var(--m-success)',

    # Tailwind yellow/amber variantes
    '#FFFBEB': 'var(--m-warning-bg)', '#FEF3C7': 'var(--m-warning-bg)',
    '#FDE68A': 'var(--m-warning-bg)', '#FEF9C3': 'var(--m-warning-bg)',
    '#fef9c3': 'var(--m-warning-bg)', '#FFEAA7': 'var(--m-warning-bg)',
    '#F7DC6F': 'var(--m-warning-bg)', '#FCD34D': 'var(--m-warning)',
    '#fde047': 'var(--m-warning)', '#F5A623': 'var(--m-warning)',
    '#B45309': 'var(--m-warning-text)', '#78350F': 'var(--m-warning-text)',
    '#854d0e': 'var(--m-warning-text)', '#FFFDF0': 'var(--m-warning-bg)',
    '#FFFBF5': 'var(--m-warning-bg)', '#FFF8F5': 'var(--m-warning-bg)',

    # Tailwind red variantes
    '#B91C1C': 'var(--m-danger)', '#dc2626': 'var(--m-danger)',
    '#7F1D1D': 'var(--m-danger-text)', '#991b1b': 'var(--m-danger-text)',
    '#C2410C': 'var(--m-danger)',
    '#FCA5A5': 'var(--m-danger-bg)', '#fca5a5': 'var(--m-danger-bg)',
    '#F87171': 'var(--m-danger-bg)', '#fee2e2': 'var(--m-danger-bg)',
    '#FF6B6B': 'var(--m-danger)', '#F43F5E': 'var(--m-danger)',
    '#FFF1F2': 'var(--m-danger-bg)', '#FDF2F8': 'var(--m-danger-bg)',

    # Tailwind blue variantes
    '#1E40AF': 'var(--m-info-text)', '#0369A1': 'var(--m-info)',
    '#0284C7': 'var(--m-info)', '#0EA5E9': 'var(--m-info)',
    '#0ea5e9': 'var(--m-info)', '#06b6d4': 'var(--m-cyan)',
    '#7DD3FC': 'var(--m-info-bg)', '#BAE6FD': 'var(--m-info-bg)',
    '#BFDBFE': 'var(--m-info-bg)', '#E0F2FE': 'var(--m-info-bg)',
    '#F0F9FF': 'var(--m-info-bg)', '#F3E8FF': 'var(--m-info-bg)',
    '#2563eb': 'var(--m-info)', '#1565C0': 'var(--m-info-text)',
    '#0C5FCC': 'var(--m-info-text)',

    # Tailwind purple variantes
    '#6366F1': 'var(--m-purple)', '#4F46E5': 'var(--m-purple)',
    '#4f46e5': 'var(--m-purple)', '#4338CA': 'var(--m-purple)',
    '#7C3AED': 'var(--m-purple)', '#7c3aed': 'var(--m-purple)',
    '#6D28D9': 'var(--m-purple)', '#5B21B6': 'var(--m-purple)',
    '#4C1D95': 'var(--m-purple)', '#9333ea': 'var(--m-purple)',
    '#7E22CE': 'var(--m-purple)', '#A21CAF': 'var(--m-purple)',
    '#C026D3': 'var(--m-purple)', '#EEF2FF': 'var(--m-purple-bg)',
    '#EEF2F7': 'var(--m-purple-bg)', '#FDF4FF': 'var(--m-purple-bg)',

    # Tailwind slate/gray variantes
    '#0F172A': 'var(--m-text)', '#1F2937': 'var(--m-text)',
    '#111111': 'var(--m-text)', '#1A1A2E': 'var(--m-text)',
    '#334151': 'var(--m-text-secondary)', '#334155': 'var(--m-text-secondary)',
    '#475569': 'var(--m-text-muted)', '#64748B': 'var(--m-text-muted)',
    '#64748b': 'var(--m-text-muted)', '#94A3B8': 'var(--m-text-muted)',
    '#9ca3af': 'var(--m-text-muted)',
    '#CBD5E1': 'var(--m-border)', '#E2E8F0': 'var(--m-border)',
    '#E9ECEF': 'var(--m-border)', '#E0E0E0': 'var(--m-border)',
    '#F1F5F9': 'var(--m-surface-2)', '#F8FAFC': 'var(--m-surface-2)',
    '#F8F9FA': 'var(--m-bg)', '#F5F5F5': 'var(--m-surface-2)',
    '#F9F9F9': 'var(--m-surface-2)', '#F0F0F0': 'var(--m-surface-2)',
    '#F0F2F5': 'var(--m-surface-2)', '#8B949E': 'var(--m-text-muted)',
    '#6C757D': 'var(--m-text-muted)', '#555': 'var(--m-text-muted)',
    '#333': 'var(--m-text)', '#ccc': 'var(--m-border)',
    '#888': 'var(--m-text-muted)', '#1e293b': 'var(--m-text)',
    '#3F3F46': 'var(--m-text-secondary)', '#18181B': 'var(--m-text)',

    # Orange variantes
    '#e04e20': 'var(--m-primary)', '#ff8c42': 'var(--m-primary)',
    '#F97316': 'var(--m-warning)', '#f97316': 'var(--m-warning)',
    '#FDBA74': 'var(--m-warning-bg)', '#FEE9D7': 'var(--m-primary-10)',
    '#FDDCCC': 'var(--m-primary-10)', '#FFF4F0': 'var(--m-primary-10)',
    '#C2410C': 'var(--m-primary)',

    # Misc colores del proyecto
    '#0D1117': 'var(--m-text)',   # code bg
    '#79C0FF': 'var(--m-info-bg)',
    '#7EE787': 'var(--m-success-bg)',
    '#DDA0DD': 'var(--m-purple-bg)',
    '#96CEB4': 'var(--m-success-bg)',
    '#98D8C8': 'var(--m-success-bg)',
    '#4ECDC4': 'var(--m-success)',
    '#45B7D1': 'var(--m-cyan)',
    '#A8E6CF': 'var(--m-success-bg)',
    '#00A8E8': 'var(--m-cyan)',
    '#F0FDF8': 'var(--m-success-bg)',
    '#FFFBF5': 'var(--m-warning-bg)',
    '#112': 'var(--m-text)',
    '#8834': 'var(--m-text-muted)',
}

# Colores de marca de terceros — NO tocar
BRAND_COLORS = {
    '#1877F2', '#25D366', '#E1306C', '#C13584', '#833AB4', '#405DE6',
    '#FD1D1D', '#4285F4', '#EA4335', '#24292E', '#003087', '#009EE3',
    '#635BFF', '#F22F46', '#EA4B71', '#FD3A5C', '#E30613', '#E37400',
    '#FF4A00', '#1A82E2', '#0C5FCC', '#BE185D', '#EC4899',
    '#000000', '#22C55E',
}

views_dir = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views'
colores_ordenados = sorted(COLOR_MAP_2.keys(), key=len, reverse=True)

total_archivos = 0
total_reemplazos = 0
sin_mapear_final = set()

for fname in sorted(os.listdir(views_dir)):
    if not fname.endswith('View.tsx'):
        continue
    fpath = os.path.join(views_dir, fname)
    content = open(fpath, encoding='utf-8').read()
    reemplazados = 0
    for hex_color in colores_ordenados:
        if hex_color in BRAND_COLORS:
            continue
        token = COLOR_MAP_2[hex_color]
        escaped = re.escape(hex_color)
        simple = re.compile(r"(:\s*['\"])" + escaped + r"(['\"])")
        antes = len(simple.findall(content))
        content = simple.sub(lambda m: m.group(1) + token + m.group(2), content)
        despues = len(simple.findall(content))
        reemplazados += (antes - despues)
    restantes = set(re.findall(r"#[0-9A-Fa-f]{3,8}\b", content))
    sin_mapear = [c for c in restantes if c not in COLOR_MAP_2 and c not in BRAND_COLORS]
    if sin_mapear:
        sin_mapear_final.update(sin_mapear)
    if reemplazados > 0:
        open(fpath, 'w', encoding='utf-8').write(content)
        total_archivos += 1
        total_reemplazos += reemplazados
        print(f'  {reemplazados:4d}  {fname}')

print(f'\nTotal segunda pasada: {total_archivos} archivos, {total_reemplazos} reemplazos')
if sin_mapear_final:
    print(f'\nAun sin mapear ({len(sin_mapear_final)}):')
    for c in sorted(sin_mapear_final): print(f'  {c}')
else:
    print('C5 completo en todo el proyecto.')
