f = r'C:\Carlos\charlie-workspace\charlie.core\src\app\components\admin\views\RepositorioView.tsx'
content = open(f, encoding='utf-8').read()

old = "  const [scoresDB, setScoresDB] = React.useState<Record<string,number>>({});"

new = """  const [scoresDB, setScoresDB] = React.useState<Record<string,number>>({});

  // Cargar scores reales desde Supabase al montar
  useEffect(() => {
    const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWdxb2JmbWdhdGF2bmJ0dmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzAzMTksImV4cCI6MjA4NjAwNjMxOX0.yZ9Zb6Jz9BKZTkn7Ld8TzeLyHsb8YhBAoCvFLPBiqZk';
    fetch('https://yomgqobfmgatavnbtvdz.supabase.co/rest/v1/modulos_auditoria?select=modulo_id,status', {
      headers: { apikey: anon, Authorization: 'Bearer ' + anon },
    })
      .then(r => r.json())
      .then((rows: { modulo_id: string; status: string }[]) => {
        const scores: Record<string, number> = {};
        for (const row of rows) {
          if (!scores[row.modulo_id]) scores[row.modulo_id] = 0;
          if (row.status === 'ok') scores[row.modulo_id]++;
        }
        setScoresDB(scores);
      })
      .catch(() => {});
  }, []);"""

result = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(result)
print('OK' if old in content else 'NO MATCH')
