// /src/index.ts
import { Env } from './types/types';
import { handleRegister, handleLogin } from './controllers/authController';
import { GET as getCategories, POST as createCategory } from './controllers/categoriasController';
import { GET as getTransacciones, POST as createTransaccion, PUT as updateTransaccion, DELETE as deleteTransaccion } from './controllers/transaccionesController';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    const method = request.method;

    switch (pathname) {
      // Rutas de autenticación
      case '/register':
        if (method === 'POST') {
          return handleRegister(request, env);
        }
        break;
      case '/login':
        if (method === 'POST') {
          return handleLogin(request, env);
        }
        break;

      // Rutas de categorías
      case '/categorias':
        switch (method) {
          case 'GET':
            return getCategories(request, env);
          case 'POST':
            return createCategory(request, env);
          default:
            return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
        }

      // Rutas de transacciones
      case '/transacciones':
        switch (method) {
          case 'GET':
            return getTransacciones(request, env);
          case 'POST':
            return createTransaccion(request, env);
          case 'PUT':
            return updateTransaccion(request, env);
          case 'DELETE':
            return deleteTransaccion(request, env);
          default:
            return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
        }

      // Ruta no válida
      default:
        return new Response(JSON.stringify({ error: 'Ruta no válida' }), { status: 404 });
    }

    // Respuesta en caso de que la ruta exista pero el método sea incorrecto para las rutas de autenticación
    return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
  }
};
