import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import GroupExpenses from '../components/GroupExpenses';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import LineChart from '../components/charts/LineChart';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function GroupDetails() {
  const { groupId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchGroup();
    fetchBalances();
    fetchChartData();
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

  const fetchBalances = async () => {
    try {
      const res = await API.get(`/group/balances/${groupId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      setBalances(res.data);
    } catch {
      toast.error('Failed to fetch balances');
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await API.get(`/expense/${groupId}/chart-data`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setChartData(res.data);
    } catch {
      toast.error('Failed to fetch chart data');
    }
  };  

  const getUsernameById = (id) => {
    if (!group || !group.members) return null;
    return group?.members?.find((m) => m._id === id)?.username || 'Member';
  };

  if (!group || !chartData) {
    return <p className="text-white p-4">Loading group details...</p>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-purple-400 mb-1">{group.name}</h2>
      <p className="text-gray-400 mb-6 italic">{group.description}</p>

      {balances.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg shadow mb-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-3 text-purple-300">Settlements</h3>
          {balances.length > 0 ? (
            <ul className="space-y-2 text-white text-sm">
              {balances
                .map((b, index) => {
                  const fromUser = getUsernameById(b.from);
                  const toUser = getUsernameById(b.to);
                  const isYouOwe = b.from === user.id;
                  const isYouGet = b.to === user.id;

                  return (
                    <li key={index}>
                      {isYouOwe && (
                        <>You owe <span className="font-semibold text-purple-400">{toUser}</span> ₹{b.amount.toFixed(2)}</>
                      )}
                      {isYouGet && !isYouOwe && (
                        <><span className="font-semibold text-purple-400">{fromUser}</span> owes you ₹{b.amount.toFixed(2)}</>
                      )}
                    </li>
                  );
                })
              }
            </ul>
          ) : (
            <p className="text-gray-400">No settlements yet!</p>
          )}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(`/group/${groupId}/add-expense`)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 w-[145px] rounded font-semibold transition"
        >
          + Add Expense
        </button>
      </div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => navigate(`/group/${groupId}/settlements`)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 w-[145px] rounded font-semibold transition"
        >
          - Settle Debts  
        </button>
      </div>

      <GroupExpenses groupId={groupId} groupMembers={group.members} />

      <h3 className="text-2xl text-white mt-10 mb-4 font-bold">Group Insights</h3>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{ 768: { slidesPerView: 2 } }}
      >
        <SwiperSlide>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow h-[400px] sm:h-[350px] xs:h-[300px] hover:scale-[1.01] transition-transform duration-200">
            <BarChart
              labels={chartData.category.labels}
              data={chartData.category.datasets[0].data}
              title="Category-wise Expenses"
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow h-[400px] sm:h-[350px] xs:h-[300px] hover:scale-[1.01] transition-transform duration-200">
            <ComparisonChart
              labels={chartData.paidOwed.labels}
              paidData={chartData.paidOwed.paidData}
              owesData={chartData.paidOwed.owesData}
            />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow h-[400px] sm:h-[350px] xs:h-[300px] hover:scale-[1.01] transition-transform duration-200">
            <LineChart
              labels={chartData.contribution.labels}
              data={chartData.contribution.datasets[0].data}
              title="Cumulative Contributions"
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
