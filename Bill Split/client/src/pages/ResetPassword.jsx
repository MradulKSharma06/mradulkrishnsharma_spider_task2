import { useState } from 'react';
import API from '../api';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const [form, setForm] = useState({
    email: '',
    otp: '',
    newPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/user/reset-password', form);
      toast.success('Password reset successful');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto text-white space-y-4">
      <h2 className="text-2xl font-bold">Reset Password</h2>
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full p-2 rounded bg-gray-700"
        required
      />
      <input
        name="otp"
        type="text"
        placeholder="Enter OTP"
        value={form.otp}
        onChange={handleChange}
        className="w-full p-2 rounded bg-gray-700"
        required
      />
      <input
        name="newPassword"
        type="password"
        placeholder="New Password"
        value={form.newPassword}
        onChange={handleChange}
        className="w-full p-2 rounded bg-gray-700"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}
