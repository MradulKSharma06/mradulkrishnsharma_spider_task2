import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function SettlePage() {
  const { user } = useContext(AuthContext);
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [note, setNote] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchGroup();
    fetchRequests();
  }, []);

  const fetchGroup = async () => {
    try {
      const res = await API.get(`/group/${groupId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGroup(res.data);
    } catch {
      toast.error('Failed to fetch group details');
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get(`/settlement/requests`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data) {
        setRequests(res.data);
      } else {
        toast.error('No request found');
      }
    } catch {
      toast.error('Could not fetch settlement requests');
    }
  };

  const submitRequest = async () => {
    if (!toUser || !amount || !referenceId) {
      return toast.error('Fill all fields');
    }

    try {
      await API.post(
        '/settlement/request',
        { groupId, to: toUser, amount, referenceId, note },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success('Settlement request sent');
      setAmount('');
      setToUser('');
      setReferenceId('');
      setNote('');
      fetchRequests();
    } catch {
      toast.error('Failed to send settlement request');
    }
  };

  const respondToRequest = async (id, action) => {
    try {
      await API.post(
        '/settlement/respond',
        { requestId: id, action },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      toast.success(`Request ${action}ed`);
      fetchRequests();
    } catch {
      toast.error('Failed to respond');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <button
        onClick={() => navigate(`/group/${groupId}`)}
        className="mb-6 text-sm text-purple-400 hover:underline"
      >
        ← Back to Group Details
      </button>

      <h2 className="text-2xl text-purple-400 font-bold mb-4">Settle Debts – {group?.name}</h2>

      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700 shadow">
        <h3 className="text-white font-semibold mb-2">Send Settlement Request</h3>
        <div className="flex flex-col gap-3">
          <select
            value={toUser}
            onChange={(e) => setToUser(e.target.value)}
            className="bg-gray-900 text-white border border-gray-700 rounded px-3 py-2"
          >
            <option value="">Select Person You Owe</option>
            {group?.members
              .filter((m) => m._id !== user._id)
              .map((m) => (
                <option key={m._id} value={m._id}>
                  {m.username}
                </option>
              ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-gray-900 text-white border border-gray-700 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Reference ID / UPI Ref"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            className="bg-gray-900 text-white border border-gray-700 rounded px-3 py-2"
          />
          <textarea
            rows={2}
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-gray-900 text-white border border-gray-700 rounded px-3 py-2"
          />
          <button
            onClick={submitRequest}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold transition"
          >
            Submit Request
          </button>
        </div>
      </div>

      {requests.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow">
          <h3 className="text-white font-semibold mb-3">Incoming Requests</h3>
          <ul className="divide-y divide-gray-700">
            {requests.map((req) => (
              <li key={req._id} className="py-3 text-sm text-white flex justify-between items-center">
                <div>
                  <p>
                    <span className="text-purple-400 font-semibold">{req.from.username}</span> sent ₹
                    {req.amount} — Ref: {req.referenceId}
                  </p>
                  {req.note && <p className="text-gray-400 text-xs italic mt-1">Note: {req.note}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondToRequest(req._id, 'approve')}
                    className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 text-white"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => respondToRequest(req._id, 'reject')}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-white"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
