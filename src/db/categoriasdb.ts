import { Category } from "../types/types";
import { D1Database } from "@cloudflare/workers-types";

export async function getCategories(db: D1Database, userId: string, type?: string): Promise<Category[]> {
  let query = 'SELECT * FROM categorias WHERE usuario_id = ?';
  const params: (string | undefined)[] = [userId];

  if (type) {
    query += ' AND tipo = ?';
    params.push(type);
  }

  const { results } = await db.prepare(query).bind(...params).all<Category>();
  return results || [];
}

export async function createCategory(db: D1Database, nombre: string, tipo: string, usuario_id: string): Promise<Category> {
  // Ejecuta la inserción en la base de datos
  await db.prepare('INSERT INTO categorias (nombre, tipo, usuario_id) VALUES (?, ?, ?)')
    .bind(nombre, tipo, usuario_id)
    .run();

  // Recupera la nueva categoría insertada basada en los datos proporcionados
  const newCategory = await db
    .prepare('SELECT * FROM categorias WHERE nombre = ? AND tipo = ? AND usuario_id = ? ORDER BY id DESC LIMIT 1')
    .bind(nombre, tipo, usuario_id)
    .first<Category>();

  if (!newCategory) {
    throw new Error('Error al obtener la categoría recién insertada');
  }

  return newCategory;
}
