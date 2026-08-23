import { NextResponse } from "next/server";

// Mapeamento de quais perfis podem acessar cada módulo do sistema
const PERMISSOES_ROTAS = {
  "/regulacao": ["ADMIN", "ADMIN_REGULA", "OPERADOR_REGULA"],
  "/regulacao/financeiro": ["ADMIN", "ADMIN_REGULA"],
  "/ccz": ["ADMIN", "VETERINARIO"],
  "/junta-medica": ["ADMIN", "ADMIN_JUNTA", "OPERADOR_JUNTA"],
  "/camara-tecnica/processos": ["ADMIN", "ADMIN_PROCESSO"],
  "/camara-tecnica/farmacia": ["ADMIN", "ADMIN_FARMACIA"],
};

export async function middleware(request) {
  const token = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // Permite acesso livre para a página de login e assets do Next.js
  if (
    pathname.startsWith("/login") || 
    pathname.startsWith("/_next") || 
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // Redireciona para o login se não houver token de sessão
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|img).*)"],
};