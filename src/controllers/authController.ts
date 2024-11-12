// Modificaciones en handleRegister y handleLogin

import { Env } from '../types/types';
import { generateJWT } from '../utils/authutils';
import { insertUser, getUserIdByFirebaseUid } from '../db/db';

export async function handleRegister(request: Request, env: Env): Promise<Response> {
  try {
    const { email, password, nombre } = await request.json();

    if (!email || !password || !nombre) {
      return new Response(JSON.stringify({ error: 'Se requiere email, password y nombre' }), { status: 400 });
    }

    const firebaseRegisterUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${env.FIREBASE_API_KEY}`;
    const body = JSON.stringify({ email, password, returnSecureToken: true });

    const firebaseResponse = await fetch(firebaseRegisterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!firebaseResponse.ok) {
      const errorData = await firebaseResponse.json();
      return new Response(JSON.stringify({ error: 'Error al registrar en Firebase', details: errorData }), { status: 400 });
    }

    const data = await firebaseResponse.json();
    const firebase_uid = data.localId;

    // Llama a la función de inserción en la base de datos
    await insertUser(env, firebase_uid, nombre, email);

    return new Response(JSON.stringify({ message: 'Usuario registrado exitosamente', uid: firebase_uid }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error en el registro' }), { status: 500 });
  }
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Se requiere email y password' }), { status: 400 });
    }

    const firebaseAuthUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.FIREBASE_API_KEY}`;
    const body = JSON.stringify({ email, password, returnSecureToken: true });

    const firebaseResponse = await fetch(firebaseAuthUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!firebaseResponse.ok) {
      const errorData = await firebaseResponse.json();
      return new Response(JSON.stringify({ error: 'Error de autenticación', details: errorData }), { status: 401 });
    }

    const data = await firebaseResponse.json();
    const firebase_uid = data.localId;

    // Obtiene el ID del usuario llamando a la función de base de datos
    const userId = await getUserIdByFirebaseUid(env, firebase_uid);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado en la base de datos' }), { status: 404 });
    }

    // Genera un JWT usando el `userId` y el `secret`
    const token = await generateJWT(userId.toString(), env.JWT_SECRET2);

    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error en la solicitud de autenticación' }), { status: 500 });
  }
}
