Write-Host "Sincronizando GymMaster PRO con la versión Web Espejo..." -ForegroundColor Yellow
npm run build
git add .
git commit -m "sync: actualizar web espejo"
git push origin main
$tree = git subtree split --prefix dist main
git push origin "${tree}:gh-pages" --force
git reset --hard origin/main
Write-Host "¡SINCRONIZACIÓN EXITOSA! La web espejo https://gymmasterpro2026-eng.github.io/gimnasio/ está 100% actualizada." -ForegroundColor Green
