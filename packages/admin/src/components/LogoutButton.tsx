// LogoutButton — clears the admin session and redirects to the login page.
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
    >
      Sign out
    </button>
  );
}
