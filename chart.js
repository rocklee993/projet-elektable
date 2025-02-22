import Chart from 'chart.js/auto';

let priceChart;
let priceData = [];
const MAX_DATA_POINTS = 20;

export function updateChart(currentPrice) {
  priceData.push(currentPrice);
  if (priceData.length > MAX_DATA_POINTS) {
    priceData.shift(); // Remove the oldest data point
  }

  const ctx = document.getElementById('price-chart').getContext('2d');

  if (!priceChart) {
    priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: MAX_DATA_POINTS }, (_, i) => i - (MAX_DATA_POINTS - priceData.length))), // Dynamic labels
        datasets: [{
          label: 'Prix (€/kWh)',
          data: priceData,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          x: {
            display: false // Hide x-axis labels
          }
        }
      }
    });
  } else {
    priceChart.data.datasets[0].data = priceData;
    priceChart.data.labels = Array.from({ length: MAX_DATA_POINTS }, (_, i) => i - (MAX_DATA_POINTS - priceData.length));
    priceChart.update();
  }
}