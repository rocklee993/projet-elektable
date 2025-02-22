import { updateChart } from './chart.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentPriceElement = document.getElementById('current-price');
  const getStartedButton = document.getElementById('get-started');

  // Simulated real-time price updates (replace with actual API calls)
  function updatePrice() {
    const currentPrice = (Math.random() * 0.2 + 0.05).toFixed(3); // Simulate price between 0.05 and 0.25
    currentPriceElement.textContent = currentPrice;
    updateChart(currentPrice);
  }

  // Initial price update
  updatePrice();

  // Update price every 5 seconds (adjust interval as needed)
  setInterval(updatePrice, 5000);

  getStartedButton.addEventListener('click', () => {
    alert('Fonctionnalité à venir!'); // Placeholder for signup/login
  });
});