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

export async function updateCategory(
  db: D1Database,
  id: string,
  usuario_id: string,
  nombre?: string,
  tipo?: string
): Promise<Category> {
  // Construimos el query dinámicamente según los campos proporcionados
  let query = 'UPDATE categorias SET ';
  const params: (string | undefined)[] = [];

  if (nombre) {
    query += 'nombre = ?, ';
    params.push(nombre);
  }
  if (tipo) {
    query += 'tipo = ?, ';
    params.push(tipo);
  }

  // Quitamos la última coma y espacio, y agregamos la condición para el ID y el usuario_id
  query = query.slice(0, -2) + ' WHERE id = ? AND usuario_id = ?';
  params.push(id, usuario_id);

  // Ejecutamos la actualización
  await db.prepare(query).bind(...params).run();

  // Recuperamos la categoría actualizada para devolverla
  const updatedCategory = await db
    .prepare('SELECT * FROM categorias WHERE id = ? AND usuario_id = ?')
    .bind(id, usuario_id)
    .first<Category>();

  if (!updatedCategory) {
    throw new Error('Error al obtener la categoría actualizada');
  }

  return updatedCategory;
}


export async function deleteCategory(db: D1Database, id: string, usuario_id: string): Promise<void> {
  // Ejecutamos la eliminación en la base de datos con la condición de usuario_id
  await db.prepare('DELETE FROM categorias WHERE id = ? AND usuario_id = ?')
    .bind(id, usuario_id)
    .run();
}

