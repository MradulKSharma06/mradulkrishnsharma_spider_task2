import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { toast } from 'react-toastify';
import { FaUserAlt, FaLock } from 'react-icons/fa';

export default function Login() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      login(res.data);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md animate-fade-in">
        <h1 className="text-3xl font-extrabold text-purple-500 text-center mb-1">BillSplit</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Split smart, spend better.</p>
        <h2 className="text-xl font-semibold mb-4 text-center">Login to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <FaUserAlt className="absolute top-3 left-3 text-gray-400" />
            <input
              name="emailOrUsername"
              placeholder="Email or Username"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              required
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-3 left-3 text-gray-400" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 transition-all py-2 rounded-md font-semibold"
          >
            Login
          </button>
        </form>

        {/* Placeholder for OAuth */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Or login with
          <div className="flex justify-center gap-4 mt-2">
            <button
              className="bg-white text-gray-800 px-4 py-1 rounded-md shadow hover:scale-105 transition"
              disabled
            >
              Google
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-300">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-400 hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-6 text-center text-sm text-gray-300">
          Forgot your password?{' '}
          <Link to="/forgot-password" className="text-purple-400 hover:underline">
            Reset it
          </Link>
        </p>
      </div>
    </div>
  );
}
