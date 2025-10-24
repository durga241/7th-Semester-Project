import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PriceChart = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Tomatoes (₹/kg)',
        data: [35, 38, 42, 39, 36, 40, 45, 48, 44, 41, 38, 40],
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4CAF50',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Onions (₹/kg)',
        data: [25, 28, 32, 35, 30, 28, 26, 24, 27, 29, 31, 28],
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FF9800',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Potatoes (₹/kg)',
        data: [20, 22, 25, 28, 26, 24, 22, 20, 23, 25, 27, 24],
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#9C27B0',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
          color: '#4B5563',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ₹${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            family: 'Inter, sans-serif',
          },
          callback: function(value: any) {
            return '₹' + value;
          }
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground flex items-center">
          📈 Price Trends (2024)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly price trends for popular vegetables
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={data} options={options} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-success/10 rounded-lg">
            <div className="text-success font-semibold">🍅 Tomatoes</div>
            <div className="text-sm text-muted-foreground">Avg: ₹41/kg</div>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-lg">
            <div className="text-orange-600 font-semibold">🧅 Onions</div>
            <div className="text-sm text-muted-foreground">Avg: ₹29/kg</div>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <div className="text-purple-600 font-semibold">🥔 Potatoes</div>
            <div className="text-sm text-muted-foreground">Avg: ₹24/kg</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;