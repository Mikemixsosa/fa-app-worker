import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  'fa-db': D1Database;
  FIREBASE_API_KEY: string; 
  JWT_SECRET2: string;
}

export interface Category {
  id: number;
  nombre: string;
  tipo: string;
  usuario_id: string;
}


export interface Transaccion {
  id?: number; // Opcional ya que el ID será autogenerado
  descripcion: string;
  monto: number;
  fecha?: string; // Opcional, el valor por defecto es la fecha actual
  tipo: string;
  categoria_id: number;
  usuario_id: number;
}
