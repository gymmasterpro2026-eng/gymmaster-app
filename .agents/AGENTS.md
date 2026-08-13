# Reglas de Despliegue para GymMaster PRO

Cuando el usuario pida "subir los cambios", "actualizar github" o "desplegar", **NUNCA utilices el script `npm run sync` ni el archivo `sync.ps1`**. 
Dado que el repositorio cuenta con un bot automatizado de GitHub Actions (pages-build-deployment) que vigila la rama `main`, forzar un push a `gh-pages` genera un error de "cannot lock ref".

En su lugar, debes utilizar **únicamente** la siguiente secuencia de comandos estándar de Git para enviar los cambios a la nube y dejar que el bot haga el resto:

```bash
git add .
git commit -m "actualizaciones (o el mensaje descriptivo)"
git push origin main
```
