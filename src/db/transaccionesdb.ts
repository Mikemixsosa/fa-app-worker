// /src/db/transaccionesdb.ts
import { Env } from '../types/types';
import { Transaccion } from '../types/types';

// Crear una nueva transacción
// /src/db/transaccionesdb.ts
export async function createTransaccion(env: Env, transaccion: Transaccion): Promise<Transaccion | null> {
    const query = transaccion.fecha
        ? `
            INSERT INTO transacciones (descripcion, monto, fecha, tipo, categoria_id, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `
        : `
            INSERT INTO transacciones (descripcion, monto, tipo, categoria_id, usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `;

    const values = transaccion.fecha
        ? [
            transaccion.descripcion,
            transaccion.monto,
            transaccion.fecha, // Si 'fecha' está definida, se incluye
            transaccion.tipo,
            transaccion.categoria_id,
            transaccion.usuario_id,
        ]
        : [
            transaccion.descripcion,
            transaccion.monto,
            transaccion.tipo,
            transaccion.categoria_id,
            transaccion.usuario_id,
        ];

    const result = await env['fa-db'].prepare(query).bind(...values).run();

    // Usar meta.last_row_id para obtener el ID de la última inserción
    return result.success ? { ...transaccion, id: result.meta.last_row_id as number } : null;
}

  

// Obtener transacciones por usuario
export async function getTransaccionesByUserId(env: Env, usuario_id: number): Promise<Transaccion[]> {
  const query = `
    SELECT * FROM transacciones
    WHERE usuario_id = ?
  `;
  const result = await env['fa-db'].prepare(query).bind(usuario_id).all<Transaccion>();
  return result.results || [];
}

// Obtener una transacción específica por ID y usuario
export async function getTransaccionById(env: Env, id: number, usuario_id: number): Promise<Transaccion | null> {
  const query = `
    SELECT * FROM transacciones
    WHERE id = ? AND usuario_id = ?
  `;
  const result = await env['fa-db'].prepare(query).bind(id, usuario_id).first<Transaccion>();
  return result || null;
}

// Actualizar una transacción por ID y usuario
export async function updateTransaccion(env: Env, id: number, usuario_id: number, transaccion: Partial<Transaccion>): Promise<boolean> {
  const fields = [];
  const values = [];

  if (transaccion.descripcion) { fields.push('descripcion = ?'); values.push(transaccion.descripcion); }
  if (transaccion.monto) { fields.push('monto = ?'); values.push(transaccion.monto); }
  if (transaccion.fecha) { fields.push('fecha = ?'); values.push(transaccion.fecha); }
  if (transaccion.tipo) { fields.push('tipo = ?'); values.push(transaccion.tipo); }
  if (transaccion.categoria_id) { fields.push('categoria_id = ?'); values.push(transaccion.categoria_id); }
  values.push(id, usuario_id);

  const query = `
    UPDATE transacciones SET ${fields.join(', ')}
    WHERE id = ? AND usuario_id = ?
  `;
  
  const result = await env['fa-db'].prepare(query).bind(...values).run();
  return result.success;
}

// Eliminar una transacción por ID y usuario
export async function deleteTransaccion(env: Env, id: number, usuario_id: number): Promise<boolean> {
  const query = `
    DELETE FROM transacciones
    WHERE id = ? AND usuario_id = ?
  `;
  
  const result = await env['fa-db'].prepare(query).bind(id, usuario_id).run();
  return result.success;
}
