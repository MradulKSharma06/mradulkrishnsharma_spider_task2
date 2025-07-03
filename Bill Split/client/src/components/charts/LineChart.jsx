import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(LineElement, PointElement, Tooltip, CategoryScale, LinearScale, Legend, Filler);

export default function LineChart({ labels = [], data = [], title = 'Line Chart' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: '#dea584',
        backgroundColor: '#dea58433',
        tension: 0.4,
        fill: true,
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
    },
  };

  if (!data.length) {
    return <p className="text-gray-400 italic text-sm text-center">No data available for line chart</p>;
  }

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700 shadow-md">
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <Line data={chartData} options={options} />
    </div>
  );
}
