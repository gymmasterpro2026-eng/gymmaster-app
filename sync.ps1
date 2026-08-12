Write-Host "Sincronizando GymMaster PRO con la version Web Espejo..." -ForegroundColor Yellow
npm run build
New-Item -ItemType File -Force -Path dist/.nojekyll
git add .
git commit -m "sync: actualizar web espejo"
git push origin main
$tree = git subtree split --prefix dist main
git push origin "${tree}:gh-pages" --force
git reset --hard origin/main
Write-Host "SINCRONIZACION EXITOSA! La web espejo https://gymmasterpro2026-eng.github.io/gymmaster-app/ esta 100% actualizada." -ForegroundColor Green
