
// Función para codificar en Base64 URL Safe
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, ''); // Remover padding
}

export async function generateJWT(userId: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = { userId, exp: Math.floor(Date.now() / 1000) + (60 * 60) }; // Expira en 1 hora

  const header = { alg: 'HS256', typ: 'JWT' };

  // Codificación Base64 URL Safe para header y payload
  const base64Header = base64UrlEncode(JSON.stringify(header));
  const base64Payload = base64UrlEncode(JSON.stringify(data));

  const unsignedToken = `${base64Header}.${base64Payload}`;

  // Importar la clave para HMAC con SHA-256
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),  // Usar el secreto recibido como parámetro
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );

  // Firmar el token sin firmar (header + payload)
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(unsignedToken));

  // Codificación Base64 URL Safe para la firma
  const base64Signature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return `${unsignedToken}.${base64Signature}`;
}

export async function verifyJWT(token: string, secret: string): Promise<string | null> {
  const encoder = new TextEncoder();

  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');

    const unsignedToken = `${headerB64}.${payloadB64}`;

    // Decodificar la firma del JWT
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

    // Importar la clave para HMAC SHA-256
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: { name: "SHA-256" } },
      false,
      ["verify"]
    );

    // Verificar la firma del token
    const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(unsignedToken));

    if (!isValid) {
      throw new Error("Token inválido");
    }

    // Decodificar el payload para extraer el `userId`
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (isTokenExpired(token)) {
      throw new Error("Token expirado");
    }

    return payload.userId || null;
  } catch (error) {
    console.error("Error al verificar el JWT:", error);
    return null;
  }
}






export function isTokenExpired(token: string): boolean {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}
