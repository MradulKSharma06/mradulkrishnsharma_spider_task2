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

export default function BarChart({ labels = [], data = [], title = 'Bar Chart' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: '#8b69c2',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        ticks: { color: '#ccc' },
        grid: { color: '#444' },
      },
      x: {
        ticks: { color: '#ccc' },
        grid: { color: '#444' },
      },
    },
    plugins: {
      legend: {
        labels: { color: '#aaa' },
      },
    },
  };

  if (!data.length) {
    return <p className="text-gray-400 italic text-sm text-center">No data available for bar chart</p>;
  }

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700 shadow-md">
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <Bar data={chartData} options={options} />
    </div>
  );
}
