import { getCategories, createCategory, updateCategory, deleteCategory } from '../db/categoriasdb';
import { Env } from '../types/types';
import { verifyJWT } from '../utils/authutils';

export async function GET(request: Request, env: Env): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autorización requerido' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const token = authHeader.split(' ')[1];
    const userId = await verifyJWT(token, env.JWT_SECRET2);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const categories = await getCategories(env['fa-db'], userId, type || undefined);
    
    return new Response(JSON.stringify(categories), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener categorías' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(request: Request, env: Env): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autorización requerido' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const token = authHeader.split(' ')[1];
    const userId = await verifyJWT(token, env.JWT_SECRET2);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { nombre, tipo } = await request.json();
    
    // Verificación para que `tipo` solo acepte 'Ingreso' o 'Gasto'
    if (!nombre || !tipo || (tipo !== 'Ingreso' && tipo !== 'Gasto')) {
      return new Response(JSON.stringify({ error: 'Se requieren nombre y tipo válido ("Ingreso" o "Gasto")' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const newCategory = await createCategory(env['fa-db'], nombre, tipo, userId);
    return new Response(JSON.stringify(newCategory), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    return new Response(JSON.stringify({ error: 'Error al crear categoría' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(request: Request, env: Env): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autorización requerido' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const token = authHeader.split(' ')[1];
    const userId = await verifyJWT(token, env.JWT_SECRET2);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { id, nombre, tipo } = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Se requiere el ID de la categoría para actualizar' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Verificación para que `tipo` solo acepte 'Ingreso' o 'Gasto'
    if (tipo && tipo !== 'Ingreso' && tipo !== 'Gasto') {
      return new Response(JSON.stringify({ error: 'El campo tipo debe ser "Ingreso" o "Gasto"' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const updatedCategory = await updateCategory(env['fa-db'], id, userId, nombre, tipo);
    return new Response(JSON.stringify(updatedCategory), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar categoría' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}


export async function DELETE(request: Request, env: Env): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Token de autorización requerido' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const token = authHeader.split(' ')[1];
    const userId = await verifyJWT(token, env.JWT_SECRET2);

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { id } = await request.json();
    if (!id) {
      return new Response(JSON.stringify({ error: 'Se requiere el ID de la categoría para eliminar' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    await deleteCategory(env['fa-db'], id, userId);

    return new Response(JSON.stringify({ message: 'Categoría eliminada correctamente' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar categoría' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
