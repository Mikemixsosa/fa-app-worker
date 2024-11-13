// /src/index.ts
import { Env } from './types/types';
import { handleRegister, handleLogin } from './controllers/authController';
import { GET as getCategories, POST as createCategory, PUT as updateCategory, DELETE as deleteCategory } from './controllers/categoriasController';
import { GET as getTransacciones, POST as createTransaccion, PUT as updateTransaccion, DELETE as deleteTransaccion } from './controllers/transaccionesController';

// Función para agregar encabezados CORS
function handleCors(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*"); // Cambia "*" a "http://localhost:3000" si quieres limitar el acceso solo a tu entorno local
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    const method = request.method;

    // Manejo de preflight request (OPTIONS)
    if (method === 'OPTIONS') {
      return handleCors(new Response(null, { status: 204 }));
    }

    let response: Response;

    switch (pathname) {
      // Rutas de autenticación
      case '/register':
        if (method === 'POST') {
          response = await handleRegister(request, env);
          return handleCors(response);
        }
        break;
      case '/login':
        if (method === 'POST') {
          response = await handleLogin(request, env);
          return handleCors(response);
        }
        break;

      // Rutas de categorías
      case '/categorias':
        switch (method) {
          case 'GET':
            response = await getCategories(request, env);
            return handleCors(response);
          case 'POST':
            response = await createCategory(request, env);
            return handleCors(response);
          case 'PUT':
            response = await updateCategory(request, env);
            return handleCors(response);
          case 'DELETE':
            response = await deleteCategory(request, env);
            return handleCors(response);
          default:
            response = new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
            return handleCors(response);
        }


      // Rutas de transacciones
      case '/transacciones':
        switch (method) {
          case 'GET':
            response = await getTransacciones(request, env);
            return handleCors(response);
          case 'POST':
            response = await createTransaccion(request, env);
            return handleCors(response);
          case 'PUT':
            response = await updateTransaccion(request, env);
            return handleCors(response);
          case 'DELETE':
            response = await deleteTransaccion(request, env);
            return handleCors(response);
          default:
            response = new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
            return handleCors(response);
        }

      // Ruta no válida
      default:
        response = new Response(JSON.stringify({ error: 'Ruta no válida' }), { status: 404 });
        return handleCors(response);
    }

    // Respuesta en caso de que la ruta exista pero el método sea incorrecto
    response = new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405 });
    return handleCors(response);
  }
};
