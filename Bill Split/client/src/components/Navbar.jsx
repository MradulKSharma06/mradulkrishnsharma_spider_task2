import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BellIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-gray-800 px-6 py-4 flex justify-between items-center shadow-md relative z-20">
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <Link to='/' ><h1 className="text-2xl font-bold text-purple-500">BillSplit</h1></Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-purple-400 font-medium">Home</Link>
            <Link to="/friends" className="hover:text-purple-400 font-medium">Friends</Link>
            <Link to="/groups" className="hover:text-purple-400 font-medium">Groups</Link>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-5">
          <button className="relative hover:text-purple-400" title="Notifications">
            <BellIcon className="w-6 h-6 text-white" />
          </button>

          {/* Profile dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 rounded-full bg-purple-600 text-white text-lg font-bold flex items-center justify-center overflow-hidden"
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.username[0]?.toUpperCase()
              )}
            </button>
            
            {profileOpen && (
              <div className="absolute right-0 mt-2 bg-gray-700 rounded shadow-md w-44 z-50">
                <div className="px-4 py-2 border-b border-gray-600 font-semibold">
                  {user.username}
                </div>
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-600"
                  onClick={() => setProfileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Icon */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden focus:outline-none"
          >
            <Bars3Icon className="w-7 h-7 text-white" />
          </button>
        </div>
      </nav>

      {/* Sidebar Drawer for Mobile */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-800 z-40 shadow-lg transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-600">
          <h2 className="text-xl font-bold text-purple-500">Menu</h2>
          <button onClick={() => setMenuOpen(false)}>
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex flex-col p-4 space-y-4">
          <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-purple-400 font-medium">
            Home
          </Link>
          <Link to="/friends" onClick={() => setMenuOpen(false)} className="hover:text-purple-400 font-medium">
            Friends
          </Link>
          <Link to="/groups" onClick={() => setMenuOpen(false)} className="hover:text-purple-400 font-medium">
            Groups
          </Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)} className="hover:text-purple-400 font-medium">
            Profile
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="text-left text-red-400 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
