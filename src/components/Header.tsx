import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { UserData } from "../types/auth";

export default function Header() {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data() as UserData);
        }
      }
    };

    fetchUserData();
  }, [user]);

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

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <div
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:flex absolute md:relative top-16 md:top-0 left-0 right-0 md:right-auto bg-white md:bg-transparent flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 p-4 md:p-0 shadow-lg md:shadow-none`}
          >
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 w-full md:w-auto"
            >
              Home
            </Link>
            {loading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : user ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">
                    {user.displayName || userData?.fullName || user?.email}
                  </span>
                </span>
                <div className="hidden md:block h-4 w-px bg-gray-300" />
                <Link
                  to="/designs"
                  className="text-gray-600 hover:text-gray-900 w-full md:w-auto"
                >
                  My Designs
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors w-full md:w-auto"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 w-full md:w-auto"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors w-full md:w-auto"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
