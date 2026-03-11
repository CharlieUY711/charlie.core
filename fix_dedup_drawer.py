f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\DrawerAuditoria.tsx'
content = open(f, encoding='utf-8').read()

old = """  const [nuevoPaso, setNuevoPaso]       = useState('');
  const [reparando, setReparando]       = useState(false);
  const [reparResult, setReparResult]   = useState<{reparados:any[];pendientes:any[]} | null>(null);
  const [showPendiente, setShowPendiente] = useState<string | null>(null);
  const [reparando, setReparando]       = useState(false);
  const [reparResult, setReparResult]   = useState<{reparados:any[];pendientes:any[]} | null>(null);
  const [showPendiente, setShowPendiente] = useState<string | null>(null);"""

new = """  const [nuevoPaso, setNuevoPaso]       = useState('');
  const [reparando, setReparando]       = useState(false);
  const [reparResult, setReparResult]   = useState<{reparados:any[];pendientes:any[]} | null>(null);
  const [showPendiente, setShowPendiente] = useState<string | null>(null);"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH - mostrando lineas 50-60:')
if old not in content:
    lines = content.splitlines()
    for i, l in enumerate(lines[48:62], start=49):
        print(i, repr(l))
