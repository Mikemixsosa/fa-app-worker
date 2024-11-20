// /src/controllers/transaccionesController.ts
import { Env } from '../types/types';
import { verifyJWT } from '../utils/authutils';
import {
    createTransaccion,
    getTransaccionesByUserId,
    getTransaccionById,
    updateTransaccion,
    deleteTransaccion
} from '../db/transaccionesdb';
import { Transaccion } from '../types/types';

// Crear una transacción
// Crear una transacción
export async function POST(request: Request, env: Env): Promise<Response> {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Token de autorización requerido' }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const usuario_id = await verifyJWT(token, env.JWT_SECRET2);
        if (!usuario_id) {
            return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401 });
        }

        // Obtén los datos del cuerpo de la solicitud
        const { descripcion, monto, tipo, categoria_id } = await request.json();

        console.log('Valores recibidos:');
        console.log('descripcion:', descripcion);
        console.log('monto:', monto);
        console.log('tipo:', tipo);
        console.log('categoria_id:', categoria_id);
        console.log('usuario_id:', usuario_id);

        // Validación para asegurar que todos los datos requeridos están presentes
        if (!descripcion || monto === undefined || !tipo || !categoria_id || usuario_id === undefined) {
            return new Response(JSON.stringify({ error: 'Todos los campos son requeridos: descripcion, monto, tipo, categoria_id, usuario_id' }), { status: 400 });
        }

        // Validación específica para 'tipo'
        if (tipo !== 'Ingreso' && tipo !== 'Gasto') {
            return new Response(JSON.stringify({ error: 'El campo tipo debe ser "Ingreso" o "Gasto"' }), { status: 400 });
        }

        const nuevaTransaccion: Transaccion = {
            descripcion,
            monto,
            tipo: tipo as 'Ingreso' | 'Gasto', // Tipo restringido
            categoria_id,
            usuario_id
        };

        const transaccionGuardada = await createTransaccion(env, nuevaTransaccion);
        return new Response(JSON.stringify(transaccionGuardada), { status: 201 });
    } catch (error) {
        console.error('Error al crear transacción:', error);
        return new Response(JSON.stringify({ error: 'Error al crear transacción' }), { status: 500 });
    }
}





// Obtener todas las transacciones de un usuario
export async function GET(request: Request, env: Env): Promise<Response> {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Token de autorización requerido' }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const usuario_id = await verifyJWT(token, env.JWT_SECRET2);
        if (!usuario_id) return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401 });

        const transacciones = await getTransaccionesByUserId(env, usuario_id);
        return new Response(JSON.stringify(transacciones), { status: 200 });
    } catch (error) {
        console.error('Error al obtener transacciones:', error);
        return new Response(JSON.stringify({ error: 'Error al obtener transacciones' }), { status: 500 });
    }
}

// Actualizar una transacción
export async function PUT(request: Request, env: Env): Promise<Response> {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Token de autorización requerido' }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const usuario_id = await verifyJWT(token, env.JWT_SECRET2);
        if (!usuario_id) {
            return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401 });
        }

        const { id, descripcion, monto, tipo, categoria_id } = await request.json();

        // Verificación para que `tipo` solo acepte 'Ingreso' o 'Gasto'
        if (tipo && tipo !== 'Ingreso' && tipo !== 'Gasto') {
            return new Response(JSON.stringify({ error: 'El campo tipo debe ser "Ingreso" o "Gasto"' }), { status: 400 });
        }

        const success = await updateTransaccion(env, id, usuario_id, { descripcion, monto, tipo, categoria_id });
        
        return success 
            ? new Response(JSON.stringify({ message: 'Transacción actualizada' }), { status: 200 })
            : new Response(JSON.stringify({ error: 'Error al actualizar transacción' }), { status: 500 });
    } catch (error) {
        console.error('Error al actualizar transacción:', error);
        return new Response(JSON.stringify({ error: 'Error al actualizar transacción' }), { status: 500 });
    }
}


// Eliminar una transacción
export async function DELETE(request: Request, env: Env): Promise<Response> {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Token de autorización requerido' }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const usuario_id = await verifyJWT(token, env.JWT_SECRET2);
        if (!usuario_id) return new Response(JSON.stringify({ error: 'Token inválido o expirado' }), { status: 401 });

        const { id } = await request.json();
        const success = await deleteTransaccion(env, id, usuario_id);
        return success ? new Response(JSON.stringify({ message: 'Transacción eliminada' }), { status: 200 }) :
            new Response(JSON.stringify({ error: 'Error al eliminar transacción' }), { status: 500 });
    } catch (error) {
        console.error('Error al eliminar transacción:', error);
        return new Response(JSON.stringify({ error: 'Error al eliminar transacción' }), { status: 500 });
    }
}
