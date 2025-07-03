import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, setProfilePicture, logout } = useContext(AuthContext);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(user?.profilePicture || '');
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadProfilePicture = async () => {
    if (!selectedFile) return toast.error('Please select a file first');

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      setLoading(true);
      const res = await API.post('/user/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      });

      setProfilePicture(res.data.profilePicture);
      setPreview(res.data.profilePicture);
      toast.success('Profile picture updated');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword)
      return toast.error('Please fill both fields');

    try {
      setLoading(true);
      await API.post(
        '/auth/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setChangingPassword(false);
      logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen flex justify-center items-center bg-gray-900">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-lg space-y-6 border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center">Your Profile</h2>

        <div className="flex flex-col items-center space-y-3">
          <img
            src={preview || 'https://res.cloudinary.com/dz31stmeh/image/upload/v1751517957/rdyv6qkieevsee5garvy.jpg'}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-2 border-purple-500 shadow-md"
          />

          <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-full text-sm transition">
            Select Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />
          </label>

          <button
            onClick={uploadProfilePicture}
            className={`bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full font-semibold transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Picture'}
          </button>
        </div>

        <div className="text-gray-300 space-y-1 text-center">
          <p>
            <span className="font-semibold text-gray-400">Username:</span> {user.username}
          </p>
          <p>
            <span className="font-semibold text-gray-400">Email:</span> {user.email}
          </p>
        </div>

        <div className="border-t border-gray-700 pt-4">
          {changingPassword ? (
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white placeholder-gray-400"
              />

              <div className="flex space-x-3 justify-center">
                <button
                  onClick={changePassword}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Password'}
                </button>
                <button
                  onClick={() => setChangingPassword(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setChangingPassword(true)}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full w-full"
            >
              Change Password
            </button>
          )}

          <p className="text-xs text-gray-500 mt-3 text-center">
            Forgot your password?{' '}
            <span
              onClick={() => navigate('/forgot-password')}
              className="text-purple-400 hover:underline cursor-pointer"
            >
              Reset it
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
