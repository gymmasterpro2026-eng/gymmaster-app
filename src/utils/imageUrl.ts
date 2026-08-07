/**
 * Helper universal para resolver URLs de imágenes y GIFs
 * Funciona de forma transparente en Localhost, GitHub Pages (/gimnasio/) y APK Android.
 */
export function fixImageUrl(url?: string): string {
  if (!url) {
    return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80';
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // Quitar la barra inicial si existe
  const cleanPath = url.startsWith('/') ? url.slice(1) : url;

  // Obtener la ruta base configurada por Vite (ej: "/gimnasio/" o "./")
  const meta = import.meta as any;
  const baseUrl = meta.env?.BASE_URL || './';
  const prefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return `${prefix}${cleanPath}`;
}
