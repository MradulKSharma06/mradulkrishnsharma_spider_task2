import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, Tooltip, CategoryScale, LinearScale, Legend);

export default function ComparisonChart({ labels = [], paidData = [], owesData = [] }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Paid',
        data: paidData,
        backgroundColor: '#a855f7',
        borderRadius: 5,
      },
      {
        label: 'Owes',
        data: owesData,
        backgroundColor: '#f43f5e',
        borderRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
      x: { ticks: { color: '#ccc' }, grid: { color: '#444' } },
    },
    plugins: {
      legend: { labels: { color: '#aaa' } },
      tooltip: {
        callbacks: {
          label: (ctx) => `₹${ctx.parsed.y}`,
        },
      },
    },
  };

  if (!paidData.length && !owesData.length) {
    return <p className="text-gray-400 italic text-sm text-center">No comparison data available</p>;
  }

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700 shadow-md">
      <h4 className="text-white font-semibold mb-3">Paid vs Owes</h4>
      <Bar data={chartData} options={options} />
    </div>
  );
}
