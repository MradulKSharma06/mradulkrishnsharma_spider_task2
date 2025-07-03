import { useState } from 'react';
import API from '../api';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/user/forgot-password', { email });
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending OTP');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto text-white space-y-4">
      <h2 className="text-2xl font-bold">Forgot Password</h2>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 rounded bg-gray-700"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
    </form>
  );
}
