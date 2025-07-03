import { useParams, useNavigate } from 'react-router-dom';
import { useState, useContext, useEffect } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaChevronLeft, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AddExpense() {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitEqual, setSplitEqual] = useState(true);
  const [splitAmounts, setSplitAmounts] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const fetchGroup = async () => {
    try {
      const res = await API.get(`/group/${groupId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGroup(res.data);
    } catch {
      toast.error('Failed to load group');
    }
  };

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const calculateSplitAmounts = () => {
    if (selectedMembers.length === 0 || !amount) return {};
    const equalSplit = Number(amount) / selectedMembers.length;
    const result = {};
    selectedMembers.forEach((id) => {
      result[id] = splitEqual ? Number(equalSplit.toFixed(2)) : (splitAmounts[id] || 0);
    });
    return result;
  };

  const handleInputChange = (id, value) => {
    setSplitAmounts((prev) => ({ ...prev, [id]: Number(value) }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
        toast.error('Enter a valid title');
        return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        toast.error('Enter a valid amount');
        return;
    }
    if (!paidBy) {
        toast.error('Select who paid the amount');
        return;
    }
    if (selectedMembers.length === 0) {
        toast.error('Select at least one member to split with');
        return;
    }

    const splits = calculateSplitAmounts();

    if (!splitEqual) {
        // Ensure all selected members have values entered
        for (const id of selectedMembers) {
        const value = splitAmounts[id];
        if (value === undefined || value === '' || isNaN(value) || Number(value) < 0) {
            toast.error('Enter valid custom split amounts for each selected member');
            return;
        }
        }
    }

    const totalSplit = Object.values(splits).reduce((a, b) => a + b, 0);
    if (Number(totalSplit.toFixed(2)) !== Number(amount)) {
        toast.error('Split amounts must sum to total');
        return;
    }

    try {
        const splitArray = Object.entries(splits).map(([user, amt]) => ({
        user,
        amount: amt,
        }));

        await API.post(
        `/expense/${groupId}`,
        {
            title,
            paidBy,
            amount: Number(amount),
            members: selectedMembers,
            splitAmounts: splitArray,
        },
        {
            headers: { Authorization: `Bearer ${user.token}` },
        }
        );

        setSuccess(true);
        toast.success('Expense added');
        setTimeout(() => {
        navigate(`/group/${groupId}`);
        }, 1500);
    } catch {
        toast.error('Failed to add expense');
    }
    };

  if (!group) return <p className="text-white p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-lg shadow relative overflow-hidden mt-10 mb-10">
      {success && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-90 z-10 animate-fadeIn">
          <FaCheckCircle className="text-green-400 text-6xl mb-4 animate-pop" />
          <p className="text-white text-xl font-bold">Expense Added!</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-400">Add Expense to {group.name}</h2>
        <button
          onClick={() => navigate(`/group/${groupId}`)}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-purple-400 transition"
        >
          <FaChevronLeft className="text-xs" />
          Back to Group
        </button>
      </div>

      <div className="space-y-4 text-white">
        <input
          type="text"
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="number"
          placeholder="Amount"
          step={50}
          min={100}
          max={9999}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div>
            <label className="block text-sm mb-1 text-gray-300 font-medium">Paid By</label>
            <div className="relative">
                <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full appearance-none p-2.5 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 transition duration-200 ease-in-out"
                >
                <option value="">-- Select Member --</option>
                {group.members.map((member) => (
                    <option key={member._id} value={member._id}>
                    {member.username}
                    </option>
                ))}
                </select>
                <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                </div>
            </div>
            </div>

        <div>
          <div className="mb-1 text-sm text-gray-300 font-medium">Select Members Involved:</div>
            <div className="rounded-lg border border-gray-700 bg-gray-800 max-h-40 overflow-y-auto divide-y divide-gray-700 shadow-sm">
            {group.members.map((member) => {
                const selected = selectedMembers.includes(member._id);
                return (
                <label
                    key={member._id}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer transition hover:bg-gray-700 ${
                    selected ? 'bg-purple-800/30' : ''
                    }`}
                >
                    <span className="text-white">{member.username}</span>
                    <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMember(member._id)}
                    className="w-4 h-4 accent-purple-500"
                    />
                </label>
                );
            })}
            </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm">Split Equally</span>
          <div
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
              splitEqual ? 'bg-purple-600' : 'bg-gray-500'
            }`}
            onClick={() => setSplitEqual(!splitEqual)}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                splitEqual ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </div>
        </div>

        {!splitEqual && (
            <div className="bg-gray-800 mt-2 p-3 rounded-md border border-gray-700 space-y-2 max-h-52 overflow-y-auto">
                <p className="text-sm text-gray-400 mb-2">Enter custom amounts for each selected member:</p>
                {selectedMembers.map((id) => (
                <div key={id} className="flex items-center justify-between gap-3">
                    <span className="w-1/2 truncate text-white">
                    {group.members.find((m) => m._id === id)?.username || 'User'}
                    </span>
                    <input
                    type="number"
                    value={splitAmounts[id] ?? ''}
                    onChange={(e) => handleInputChange(id, e.target.value)}
                    placeholder="₹"
                    min={0}
                    className="p-2 rounded bg-gray-900 w-28 text-white border border-gray-600 focus:outline-none focus:ring focus:ring-purple-500"
                    />
                </div>
                ))}
            </div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded font-bold text-white w-full mt-3 transition"
        >
          Add Expense
        </button>
      </div>
    </div>
  );
}
