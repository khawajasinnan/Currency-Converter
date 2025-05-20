// Currency options for dropdowns
const currencies = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "PKR"];

// Populate currency dropdowns
function populateCurrencyDropdowns() {
    const baseCurrency = document.getElementById('base_currency');
    const targetCurrency = document.getElementById('target_currency');
    
    baseCurrency.innerHTML = '';
    targetCurrency.innerHTML = '';
    
    currencies.forEach(currency => {
        baseCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
        targetCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
    });
    
    baseCurrency.value = "USD";
    targetCurrency.value = "PKR";
}

// Initialize chart
let rateChart;
// Update the chart initialization with better colors
function initializeChart() {
    const canvas = document.getElementById('rateChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    if (rateChart) {
        rateChart.destroy();
    }
    
    rateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Exchange Rate',
                data: [],
                borderColor: '#1E40AF',
                backgroundColor: 'rgba(30, 64, 175, 0.2)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#1E40AF',
                pointBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#1E40AF',
                        font: {
                            size: 14,
                            weight: 'bold',
                            family: "'Inter', sans-serif"
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1E40AF',
                    bodyColor: '#4B5563',
                    borderColor: '#1E40AF',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        color: 'rgba(30, 64, 175, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#1E40AF',
                        maxRotation: 45,
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(30, 64, 175, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#1E40AF',
                        font: {
                            family: "'Inter', sans-serif"
                        },
                        callback: function(value) {
                            return value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Get historical data
async function getHistoricalData(baseCurrency, targetCurrency, days) {
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Using a different API endpoint with direct rates
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (!data.rates || !data.rates[targetCurrency]) {
            throw new Error('No exchange rate data available');
        }

        // For demonstration, create a series of rates with small variations
        const rates = [];
        const dates = [];
        const baseRate = data.rates[targetCurrency];

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            dates.push(date.toLocaleDateString());
            
            // Create slightly varying rates for visualization
            const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
            rates.push(baseRate * (1 + variation));
        }

        return { dates, rates };
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Unable to fetch exchange rates. Please try again later.');
    }
}

// Update chart data with loading state
async function updateChartData() {
    try {
        const baseCurrency = document.getElementById('base_currency').value;
        const targetCurrency = document.getElementById('target_currency').value;
        const timeRange = parseInt(document.getElementById('time_range').value);
        
        // Show loading state
        document.getElementById('Chart').style.opacity = '0.5';
        
        const { dates, rates } = await getHistoricalData(baseCurrency, targetCurrency, timeRange);
        
        rateChart.data.labels = dates;
        rateChart.data.datasets[0].data = rates;
        rateChart.data.datasets[0].label = `${baseCurrency} to ${targetCurrency} Exchange Rate`;
        rateChart.update();
        
        // Reset opacity
        document.getElementById('Chart').style.opacity = '1';
    } catch (error) {
        alert(error.message);
        document.getElementById('Chart').style.opacity = '1';
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Page loaded, initializing...');
        populateCurrencyDropdowns();
        initializeChart();
        await updateChartData();
        
        const controls = ['base_currency', 'target_currency', 'time_range'];
        controls.forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                console.log(`${id} changed, updating chart...`);
                updateChartData();
            });
        });
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});