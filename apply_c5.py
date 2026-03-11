import re

COLOR_MAP = {
    '#E5E7EB': 'var(--m-border)', '#D1D5DB': 'var(--m-border)',
    '#F3F4F6': 'var(--m-surface-2)', '#F9FAFB': 'var(--m-surface-2)',
    '#FAFAFA': 'var(--m-surface-2)', '#F8F9FA': 'var(--m-bg)',
    '#fff': 'var(--m-surface)', '#FFF': 'var(--m-surface)',
    '#FFFFFF': 'var(--m-surface)', '#ffffff': 'var(--m-surface)',
    '#111827': 'var(--m-text)', '#111': 'var(--m-text)',
    '#374151': 'var(--m-text-secondary)', '#6B7280': 'var(--m-text-muted)',
    '#9CA3AF': 'var(--m-text-muted)', '#4B5563': 'var(--m-text-secondary)',
    '#FF6835': 'var(--m-primary)', '#ff6835': 'var(--m-primary)',
    '#F05520': 'var(--m-primary)', '#FFF4EC': 'var(--m-primary-10)',
    '#FFE8DF': 'var(--m-primary-20)',
    '#10B981': 'var(--m-success)', '#059669': 'var(--m-success)',
    '#D1FAE5': 'var(--m-success-bg)', '#065F46': 'var(--m-success-text)',
    '#166534': 'var(--m-success-text)',
    '#F59E0B': 'var(--m-warning)', '#D97706': 'var(--m-warning)',
    '#FEF3C7': 'var(--m-warning-bg)', '#FFF7ED': 'var(--m-warning-bg)',
    '#92400E': 'var(--m-warning-text)', '#FED7AA': 'var(--m-warning-border)',
    '#EF4444': 'var(--m-danger)', '#DC2626': 'var(--m-danger)',
    '#FEE2E2': 'var(--m-danger-bg)', '#FEF2F2': 'var(--m-danger-bg)',
    '#FFF5F5': 'var(--m-danger-bg)',
    '#991B1B': 'var(--m-danger-text)', '#FECACA': 'var(--m-danger-border)',
    '#3B82F6': 'var(--m-info)', '#2563EB': 'var(--m-info)',
    '#EFF6FF': 'var(--m-info-bg)', '#1D4ED8': 'var(--m-info-text)',
    '#DBEAFE': 'var(--m-info-border)',
    '#8B5CF6': 'var(--m-purple)', '#7C3AED': 'var(--m-purple)',
    '#EDE9FE': 'var(--m-purple-bg)', '#F5F3FF': 'var(--m-purple-bg)',
    '#0891B2': 'var(--m-cyan)', '#ECFEFF': 'var(--m-cyan-bg)',
}

f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\PedidosView.tsx'
content = open(f, encoding='utf-8').read()

colores_ordenados = sorted(COLOR_MAP.keys(), key=len, reverse=True)
reemplazados = 0
for hex_color in colores_ordenados:
    token = COLOR_MAP[hex_color]
    escaped = re.escape(hex_color)
    simple = re.compile(r"(:\s*['\"])" + escaped + r"(['\"])")
    antes = len(simple.findall(content))
    content = simple.sub(lambda m: m.group(1) + token + m.group(2), content)
    despues = len(simple.findall(content))
    reemplazados += (antes - despues)

open(f, 'w', encoding='utf-8').write(content)
print(f'OK — {reemplazados} colores reemplazados')
