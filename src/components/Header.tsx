import { Link } from "react-router-dom";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Header() {
  const [user, loading] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-gray-800">
            T-Shirt Designer
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : user ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">
                      {user.displayName || user.email}
                    </span>
                  </span>
                  <div className="h-4 w-px bg-gray-300" />
                  <Link
                    to="/designs"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    My Designs
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
