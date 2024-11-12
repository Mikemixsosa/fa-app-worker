import { D1Database } from '@cloudflare/workers-types';
import { Env } from '../types/types';

export const addUser = async (db: D1Database, firebase_uid: string, nombre: string, correo_electronico: string, rol: string) => {
  return db.prepare(`INSERT INTO usuarios (firebase_uid, nombre, correo_electronico, rol) VALUES (?, ?, ?, ?)`)
    .bind(firebase_uid, nombre, correo_electronico, rol)
    .run();
};


// database.ts

export async function insertUser(env: Env, firebase_uid: string, nombre: string, email: string): Promise<void> {
  await env['fa-db']
    .prepare(`INSERT INTO usuarios (firebase_uid, nombre, correo_electronico) VALUES (?, ?, ?)`)
    .bind(firebase_uid, nombre, email)
    .run();
}

export async function getUserIdByFirebaseUid(env: Env, firebase_uid: string): Promise<string | null> {
  const result = await env['fa-db']
    .prepare(`SELECT id FROM usuarios WHERE firebase_uid = ?`)
    .bind(firebase_uid)
    .first();

  return result ? result.id : null;
}
