import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ labels = [], data = [], title = 'Pie Chart' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: ['#8b69c2', '#dea584', '#ba93ea', '#c0b9bb', '#414f51'],
        borderColor: '#222',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: { color: '#aaa' },
      },
    },
  };

  if (!data.length) {
    return <p className="text-gray-400 italic text-sm text-center">No data available for pie chart</p>;
  }

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700 shadow-md">
      <h4 className="text-white font-semibold mb-3">{title}</h4>
      <Pie data={chartData} options={options} />
    </div>
  );
}
