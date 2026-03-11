# ─── audit-modules.ps1 ───────────────────────────────────────────────────────
# Escanea el proyecto real y sube auditoría C1-C8 a Supabase
# ─────────────────────────────────────────────────────────────────────────────

$ROOT       = "C:\Carlos\charlie-workspace\charlie.core\src"
$VIEWS_DIR  = "$ROOT\app\components\admin\views"
$SERVICES_DIR = "$ROOT\app\services"
$MODULES_DIR  = "$ROOT\modules"

# Supabase config — reemplazá con tus valores
$SUPABASE_URL = "https://yomgqobfmgatavnbtvdz.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWdxb2JmbWdhdGF2bmJ0dmR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MzAzMTksImV4cCI6MjA4NjAwNjMxOX0.yZ9Zb6Jz9BKZTkn7Ld8TzeLyHsb8YhBAoCvFLPBiqZk"

$ALL_VIEWS = @(
  'AbastecimientoView','AdminDashboardView','APIKeysView','AuditoriaHubView',
  'AuthRegistroView','BibliotecaWorkspace','CargaMasivaView','ChecklistView',
  'ClientesView','ConfigVistasPorRolView','ConstructorView','DashboardView',
  'DepartamentosView','DepositosView','DisenoView','DocumentacionView',
  'EcommerceView','EditorImagenesWorkspace','EntregasView','EnviosView',
  'ERPComprasView','ERPContabilidadView','ERPCRMView','ERPFacturacionView',
  'ERPInventarioView','ERPRRHHView','EtiquetaEmotivaView','FidelizacionView',
  'FulfillmentView','GenDocumentosWorkspace','GenPresupuestosWorkspace',
  'GestionView','GoogleAdsView','GoogleMapsTestView','HealthMonitorView',
  'HerramientasView','IdeasBoardView','ImpresionWorkspace',
  'IntegracionesComunicacionView','IntegracionesIdentidadView',
  'IntegracionesLogisticaView','IntegracionesMarketplaceView',
  'IntegracionesPagosView','IntegracionesRRSSView','IntegracionesServiciosView',
  'IntegracionesTiendasView','IntegracionesView','InventarioView',
  'LogisticaView','MailingView','MapaEnviosView','MarketingView',
  'MetaBusinessView','MetaMapView','MetodosEnvioView','MetodosPagoView',
  'MigracionRRSSView','OCRWorkspace','OrganizacionesView','PagosView',
  'PedidosView','PersonasView','POSView','ProduccionView','ProyectosView',
  'QrGeneratorView','RedesSocialesView','RepositorioAPIsView','RRSSHubView',
  'RuedaSorteosView','RutasView','SEOView','SecondHandView',
  'SistemaView','SystemLogsView','TrackingPublicoView','TransportistasView',
  'UnifiedWorkspaceView','UserDashboardView','VehiculosView','WebhooksView'
)

$VIEW_SERVICE_MAP = @{
  AbastecimientoView='abastecimiento'; DepartamentosView='departamentos'
  DepositosView='depositos'; EntregasView='entregas'; EnviosView='envios'
  FulfillmentView='fulfillment'; InventarioView='inventario'
  MapaEnviosView='mapaEnvios'; MetodosEnvioView='metodosEnvio'
  MetodosPagoView='metodosPago'; OrganizacionesView='organizaciones'
  PagosView='metodosPago'; PedidosView='pedidos'; PersonasView='personas'
  ProduccionView='produccion'; RutasView='rutas'; TrackingPublicoView='tracking'
  TransportistasView='transportistas'; VehiculosView='vehiculos'
  GoogleAdsView='marketing'; MailingView='marketing'; RedesSocialesView='rrss'
}

$HUBS = @('LogisticaView','MarketingView','HerramientasView','EcommerceView',
  'IntegracionesView','SistemaView','DashboardView','AdminDashboardView',
  'GestionView','UserDashboardView')

function Upsert-Criterio($moduloId, $criterioId, $status, $detalle) {
  $body = @{
    modulo_id   = $moduloId
    criterio_id = $criterioId
    status      = $status
    detalle     = $detalle
    updated_at  = (Get-Date -Format "o")
  } | ConvertTo-Json

  $headers = @{
    "apikey"        = $SUPABASE_KEY
    "Authorization" = "Bearer $SUPABASE_KEY"
    "Content-Type"  = "application/json"
    "Prefer"        = "resolution=merge-duplicates"
  }

  try {
    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/modulos_auditoria" `
      -Method POST -Headers $headers -Body $body | Out-Null
  } catch {
    Write-Host "  ⚠️  Error upserting $moduloId/$criterioId" -ForegroundColor Yellow
  }
}

$total = $ALL_VIEWS.Count
$i = 0

foreach ($viewFile in $ALL_VIEWS) {
  $i++
  $moduloId  = $viewFile -replace 'View$|Workspace$','' -replace '([A-Z])', ' $1'
  $moduloId  = ($viewFile -replace 'View$|Workspace$','').ToLower()
  $esHub     = $HUBS -contains $viewFile
  $serviceKey = $VIEW_SERVICE_MAP[$viewFile]

  # Nombre del archivo view (con extensión alternativa para Workspace)
  $ext = if ($viewFile -match 'Workspace') { '.tsx' } else { '.tsx' }
  $viewPath = "$VIEWS_DIR\$viewFile$ext"

  Write-Host "[$i/$total] $moduloId" -NoNewline

  # ── C1: Existe el archivo view ──────────────────────────────────────────────
  $c1 = if (Test-Path $viewPath) { 'ok' } else { 'fail' }
  $c1d = if ($c1 -eq 'ok') { "$viewFile.tsx encontrado" } else { "No existe $viewFile.tsx" }
  Upsert-Criterio $moduloId 'C1' $c1 $c1d

  # ── C2: Tiene schema/tabla en Supabase ──────────────────────────────────────
  # Buscamos referencia al serviceKey en cualquier Api.ts
  $c2 = 'fail'; $c2d = 'Sin tabla verificada'
  if ($esHub) { $c2 = 'partial'; $c2d = 'Hub — sin tabla directa por diseño' }
  elseif ($serviceKey) {
    $apiPath = "$SERVICES_DIR\${serviceKey}Api.ts"
    $schemaRef = Get-ChildItem "$ROOT" -Recurse -Filter "*.sql" -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match $serviceKey } | Select-Object -First 1
    if ($schemaRef) { $c2 = 'ok'; $c2d = "schema encontrado: $($schemaRef.Name)" }
    elseif (Test-Path $apiPath) { $c2 = 'partial'; $c2d = "Api existe pero sin schema.sql verificado" }
  }
  Upsert-Criterio $moduloId 'C2' $c2 $c2d

  # ── C3: Existe *Api.ts en /services/ ───────────────────────────────────────
  $c3 = 'fail'; $c3d = 'No existe archivo de servicio'
  if ($esHub) { $c3 = 'partial'; $c3d = 'Hub — sin service propio por diseño' }
  elseif ($serviceKey) {
    $apiPath = "$SERVICES_DIR\${serviceKey}Api.ts"
    if (Test-Path $apiPath) {
      $c3 = 'ok'; $c3d = "${serviceKey}Api.ts encontrado"
    }
  }
  Upsert-Criterio $moduloId 'C3' $c3 $c3d

  # ── C4: Existe module.config.ts ─────────────────────────────────────────────
  $configPath = "$MODULES_DIR\$moduloId\module.config.ts"
  $c4 = if (Test-Path $configPath) { 'ok' } else { 'fail' }
  $c4d = if ($c4 -eq 'ok') { 'module.config.ts presente' } else { 'Falta module.config.ts' }
  Upsert-Criterio $moduloId 'C4' $c4 $c4d

  # ── C5: Sin colores hardcodeados (#HEX o rgb()) ─────────────────────────────
  $c5 = 'unknown'; $c5d = 'No verificado'
  if (Test-Path $viewPath) {
    $content = Get-Content $viewPath -Raw
    $hexMatches = [regex]::Matches($content, '#[0-9A-Fa-f]{3,6}\b').Count
    $rgbMatches = [regex]::Matches($content, 'rgb\(').Count
    if ($hexMatches -gt 0 -or $rgbMatches -gt 0) {
      $c5 = 'fail'
      $c5d = "$hexMatches valores hex + $rgbMatches rgb() hardcodeados"
    } else {
      $c5 = 'ok'
      $c5d = 'Sin colores hardcodeados detectados'
    }
  }
  Upsert-Criterio $moduloId 'C5' $c5 $c5d

  # ── C6: Existe tokens.css ───────────────────────────────────────────────────
  $tokensPath = "$MODULES_DIR\$moduloId\ui\tokens.css"
  $c6 = if (Test-Path $tokensPath) { 'ok' } else { 'fail' }
  $c6d = if ($c6 -eq 'ok') { 'tokens.css presente' } else { 'Falta tokens.css' }
  Upsert-Criterio $moduloId 'C6' $c6 $c6d

  # ── C7: Party Model (manual — marcamos unknown por defecto) ─────────────────
  Upsert-Criterio $moduloId 'C7' 'unknown' 'Requiere auditoría manual'

  # ── C8: Sin supabase.from() directo ────────────────────────────────────────
  $c8 = 'unknown'; $c8d = 'Sin service layer para verificar'
  if ($serviceKey -and (Test-Path "$SERVICES_DIR\${serviceKey}Api.ts")) {
    $apiContent = Get-Content "$SERVICES_DIR\${serviceKey}Api.ts" -Raw
    $fromCount = [regex]::Matches($apiContent, '\.from\(').Count
    if ($fromCount -eq 0) { $c8 = 'ok'; $c8d = 'Sin supabase.from() directo' }
    else { $c8 = 'fail'; $c8d = "$fromCount ocurrencias de .from() hardcodeado" }
  }
  Upsert-Criterio $moduloId 'C8' $c8 $c8d

  Write-Host " ✓" -ForegroundColor Green
}

Write-Host "`n✅ Auditoría completa — $total módulos procesados." -ForegroundColor Green

