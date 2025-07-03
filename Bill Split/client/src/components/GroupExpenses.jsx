import { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function GroupExpenses({ groupId, groupMembers }) {
  const { user } = useContext(AuthContext);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (!groupId) return;
    fetchExpenses();
  }, [groupId]);

  const fetchExpenses = async () => {
    try {
      const res = await API.get(`/expense/${groupId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setExpenses(res.data);
    } catch {
      toast.error('Failed to load expenses');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await API.delete(`/expense/${expenseId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      toast.info('Expense deleted');
      fetchExpenses();
    } catch {
      toast.error('Failed to delete expense');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-md border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Expense History</h3>

      {expenses.length === 0 ? (
        <p className="text-gray-400">No expenses yet</p>
      ) : (
        <div className="max-h-96 overflow-y-auto pr-2 space-y-4 custom-scroll">
          {expenses.map((exp) => (
            <div key={exp._id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-white">{exp.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{new Date(exp.createdAt).toLocaleDateString()}</span>
                  {exp.paidBy._id === user.id && (
                    <button
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="text-red-400 hover:text-red-600 font-semibold"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-300">
                Paid by <b className="text-purple-300">{exp.paidBy.username}</b> — ₹{exp.amount}
              </p>
              <p className="text-gray-400 mt-1 text-sm">Split among:</p>
              <ul className="list-disc list-inside text-sm text-gray-300">
                {exp.splitAmounts.map((split) => {
                  const userId = split.user._id || split.user;
                  const name = groupMembers.find((m) => m._id === userId)?.username || 'User';
                  return (
                    <li key={userId + exp._id}>
                      {name}: ₹{split.amount}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
