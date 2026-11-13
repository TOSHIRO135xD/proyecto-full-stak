import { HttpErrorResponse } from '@angular/common/http';

export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con Django. Comprueba que el backend esté activo en localhost:8000.';
    }
    if (error.status === 400 && error.error && typeof error.error === 'object') {
      return Object.entries(error.error)
        .map(([campo, mensajes]) => `${campo}: ${Array.isArray(mensajes) ? mensajes.join(' ') : mensajes}`)
        .join(' · ');
    }
    return `La API respondió con un error (${error.status}). Inténtalo de nuevo.`;
  }
  return 'La petición no se completó a tiempo. Actualiza la lista para comprobar si se guardó antes de volver a enviarla.';
}
