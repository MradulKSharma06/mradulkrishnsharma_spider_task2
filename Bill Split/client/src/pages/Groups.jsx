import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import { FaPlane, FaHome, FaHeart, FaEllipsisH } from 'react-icons/fa';

const GROUP_TYPES = [
  { label: 'Travel', icon: <FaPlane size={20} /> },
  { label: 'Couple', icon: <FaHeart size={20} /> },
  { label: 'Home', icon: <FaHome size={20} /> },
  { label: 'Other', icon: <FaEllipsisH size={20} /> },
];

export default function Groups() {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupType, setGroupType] = useState('Travel');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await API.get('/group', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGroups(res.data);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const res = await API.get('/user/friends', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFriends(res.data);
    } catch {
      toast.error('Failed to load friends');
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchFriends();
  }, []);

  const toggleMember = (id) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error('Group name is required');
    if (!groupDescription.trim()) return toast.error('Group description is required');
    if (selectedMembers.length === 0) return toast.error('Select at least one friend');

    try {
      setCreating(true);
      await API.post('/group',
        {
          name: groupName,
          description: groupDescription,
          type: groupType,
          memberIds: selectedMembers
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Group created');
      setGroupName('');
      setGroupDescription('');
      setGroupType('Travel');
      setSelectedMembers([]);
      fetchGroups();
    } catch {
      toast.error('Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = (groupId) => {
    setGroupToDelete(groupId);
    setShowConfirmModal(true);
  };

  const confirmDeleteGroup = async () => {
    try {
      await API.delete(`/group/${groupToDelete}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.info('Group and related expenses deleted');
      fetchGroups();
    } catch {
      toast.error('Failed to delete group');
    } finally {
      setShowConfirmModal(false);
      setGroupToDelete(null);
    }
  };

  const handleRemoveMember = async (groupId, memberId) => {
    try {
      await API.post(`/group/${groupId}/remove-member/${memberId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.info('Member removed');
      fetchGroups();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-400">Manage Groups</h1>

        {/* Create Group */}
        <div className="bg-gray-800 p-6 rounded-md mb-10 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Group</h2>

          <input
            type="text"
            placeholder="Group Name"
            className="w-full px-4 py-2 rounded-md bg-gray-700 mb-3 focus:outline-none"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <textarea
            placeholder="Group Description"
            rows={3}
            className="w-full px-4 py-2 rounded-md bg-gray-700 mb-3 focus:outline-none resize-none"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
          />

          <p className="mb-2 font-medium">Select Group Type:</p>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 mb-5">
            {GROUP_TYPES.map(({ label, icon }) => (
              <div
                key={label}
                onClick={() => setGroupType(label)}
                className={`cursor-pointer flex flex-col justify-center items-center rounded-lg p-4 aspect-square transform transition-all duration-200 border hover:shadow-md hover:scale-[1.03] ${
                  groupType === label
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-gray-700 border-gray-600 hover:border-purple-300'
                }`}
              >
                {icon}
                <span className="mt-2 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          <p className="mb-1">Select friends to add:</p>
          <div className="max-h-40 overflow-y-auto bg-gray-700 p-3 rounded-md mb-4">
            {loadingFriends ? (
              <p className="text-gray-400">Loading friends...</p>
            ) : friends.length === 0 ? (
              <p className="text-gray-400">No friends available</p>
            ) : (
              friends.map((friend) => (
                <label key={friend._id} className="flex items-center gap-2 mb-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(friend._id)}
                    onChange={() => toggleMember(friend._id)}
                    className="accent-purple-600"
                  />
                  <span>{friend.username}</span>
                </label>
              ))
            )}
          </div>

          <button
            onClick={handleCreateGroup}
            disabled={creating}
            className={`bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-md w-full font-semibold ${
              creating ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </div>

        {/* Show Groups */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
          {loadingGroups ? (
            <p className="text-gray-400">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="text-gray-400">No groups found</p>
          ) : (
            groups.map((group) => (
              <div key={group._id} className="bg-gray-800 rounded-md p-4 mb-5 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <button
                    onClick={() => navigate(`/group/${group._id}`)}
                    className="text-lg font-semibold text-purple-300 hover:underline text-left"
                  >
                    {group.name}
                  </button>
                  {group.creator === user.id && (
                    <button
                      onClick={() => handleDeleteGroup(group._id)}
                      className="text-red-500 hover:text-red-700 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-400 italic mb-2">{group.description || 'No description provided.'}</p>
                <p className="text-xs inline-block px-3 py-1 rounded-full bg-purple-700 text-white mb-2">
                  {group.type}
                </p>
                <p className="font-medium mb-1">Members:</p>
                <ul className="list-disc list-inside max-h-28 overflow-y-auto space-y-1">
                  {group.members.map((member) => (
                    <li key={member._id} className="flex justify-between items-center">
                      <span>
                        {member.username}
                        {member._id === user.id && <span className="text-sm text-gray-400"> (You)</span>}
                        {member._id === group.creator && <span className="text-sm text-yellow-400"> (Creator)</span>}
                      </span>
                      {group.creator === user.id && member._id !== user.id && (
                        <button
                          onClick={() => handleRemoveMember(group._id, member._id)}
                          className="text-xs text-red-400 hover:text-red-600 ml-2"
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        title="Delete Group"
        message="Are you sure you want to delete this group? All related expenses will also be removed."
        onConfirm={confirmDeleteGroup}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
