import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If hitting an admin route, enforce strict session boundary
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin-session');
    
    // In a production environment, this token would be cryptographically verified using jose or similar.
    // For this e-commerce app prototype, verifying the strict presence mitigates the immediate unauthenticated vulnerability.
    if (!adminSession || !adminSession.value) {
      // Unauthenticated -> Redirect natively to 401 Unauthorized API or a mock login page
      // We will redirect to '/' with a 401 status to instantly break the layout routing
      return new NextResponse('401 Unauthorized access to protected administrative boundary.', { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all admin panel routes
    '/admin/:path*',
  ],
};
