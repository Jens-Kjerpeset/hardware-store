import { cookies } from 'next/headers';

export async function requireAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin-session');
  
  if (!session || !session.value) {
    throw new Error('Unauthorized');
  }
  
  return true;
}
