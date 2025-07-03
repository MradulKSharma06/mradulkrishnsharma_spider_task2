import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, refreshUser } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username, email: user.email });
    }
  }, [user]);

  const saveChanges = async () => {
    try {
      await API.patch('/user/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.success('Profile updated!');
      refreshUser(); // to reload latest user data
      setEditMode(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>

      <div className="bg-gray-800 p-4 rounded shadow-md max-w-md space-y-4">
        <div>
          <label className="block text-gray-300 mb-1">Username:</label>
          {editMode ? (
            <input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            />
          ) : (
            <p>{user.username}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Email:</label>
          {editMode ? (
            <input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            />
          ) : (
            <p>{user.email}</p>
          )}
        </div>

        {editMode ? (
          <div className="flex space-x-2">
            <button onClick={saveChanges} className="bg-purple-600 px-4 py-2 rounded">Save</button>
            <button onClick={() => setEditMode(false)} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditMode(true)} className="bg-purple-600 px-4 py-2 rounded">Edit Profile</button>
        )}
      </div>
    </div>
  );
}
