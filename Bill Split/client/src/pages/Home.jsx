import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { user } = useContext(AuthContext);
  const activities = []; // Later: Replace with real activity data

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-8">
        {/* Welcome Card */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-md border border-purple-600/30">
          <h2 className="text-3xl font-bold mb-2 text-purple-400">
            Welcome, {user.username} 👋
          </h2>
          <p className="text-gray-300 text-lg">
            Here's a quick look at what's happening in your dashboard.
          </p>
        </div>

        {/* Recent Activities Section */}
        <section className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">Recent Activities</h3>
            {/* (Future) Filter / Refresh actions */}
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No activities available right now.</p>
              <p className="text-sm text-gray-500 mt-1">
                Start by adding a friend, joining a group, or logging an expense.
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-gray-700 p-4 rounded-md hover:bg-gray-600 transition"
                >
                  {activity.text}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
