var input_amount = document.getElementById("original-currency-amount");
var from_currency = document.getElementById("from_currency");
var to_currency = document.getElementById("to_currency");
var exchange_rate = document.getElementById("exchange-rate");
var exchange = document.getElementById("exchange");
var output_amount = document.getElementById("output-text");
var output_from = document.getElementById("from");
var output_to = document.getElementById("to");

exchange.addEventListener("click", () => {
    [from_currency.value, to_currency.value] = [to_currency.value, from_currency.value];
    calculate();
});

var to_amount = 0;

function validateInput() {
    if (input_amount.value <= 0 || isNaN(input_amount.value)) {
        alert("Please enter a valid number greater than 0.");
        return false;
    }
    return true;
}

function calculate() {
    if (!validateInput()) return;

    const from_currency_value = from_currency.value;
    const to_currency_value = to_currency.value;

    fetch(`https://v6.exchangerate-api.com/v6/b88b5967d64b35931fb025f7/latest/${from_currency_value}`)
        .then(res => res.json())
        .then(res => {
            const rate = res.conversion_rates[to_currency_value];
            exchange_rate.value = `${rate}`;
            to_amount = (input_amount.value * rate).toFixed(3);
            output_from.innerText = `${input_amount.value} ${from_currency_value}`;
            output_to.innerText = `${to_amount} ${to_currency_value}`;
            output_amount.style.display = "block";

            const historyEntry = {
                timestamp: new Date().toLocaleString(),
                from: from_currency_value,
                to: to_currency_value,
                amount: input_amount.value,
                result: to_amount
            };
            
            let history = [];
            try {
                const existingHistory = localStorage.getItem('conversionHistory');
                history = existingHistory ? JSON.parse(existingHistory) : [];
            } catch (e) {
                history = [];
            }
            
            history.push(historyEntry);
            localStorage.setItem('conversionHistory', JSON.stringify(history));

            updateChart(from_currency_value, to_currency_value);
        })
        .catch(err => {
            console.error(err);
            alert('Error fetching exchange rate. Please try again later.');
        });
}

document.getElementById("exchange_button").addEventListener("click", () => {
    if (validateInput()) {
        calculate();
    }
});

function saveToHistory(from_currency_value, to_currency_value, amount, result) {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const conversion = {
        timestamp: new Date().toLocaleString(),
        from: from_currency_value,
        to: to_currency_value,
        amount: amount,
        result: result
    };
    history.push(conversion);
    localStorage.setItem('history', JSON.stringify(history));
    displayHistory();
}

function displayHistory() {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    const historyList = document.getElementById('history-list');
    if (historyList) {
        historyList.innerHTML = history.map(item => `
            <tr>
                <td>${item.timestamp}</td>
                <td>${item.from}</td>
                <td>${item.to}</td>
                <td>${item.amount}</td>
                <td>${item.result}</td>
            </tr>
        `).join('');
    }
}

if (document.getElementById('clear-history')) {
    document.getElementById('clear-history').addEventListener('click', () => {
        localStorage.removeItem('history');
        displayHistory();
    });
}

window.onload = () => {
    if (document.getElementById('language-selector')) {
        setLanguage('en');
        loadGraph(from_currency.value, to_currency.value);
    }
    
    displayHistory();
};

function loadGraph(from_currency_value, to_currency_value) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); 
    const formattedStartDate = startDate.toISOString().split('T')[0];

    fetch(`https://v6.exchangerate-api.com/v6/b88b5967d64b35931fb025f7/latest/USD`)
        .then(res => res.json())
        .then(data => {
            const dates = [];
            const rates = [];

            for (const date in data.rates) {
                dates.push(date);
                rates.push(data.rates[date][to_currency_value]);
            }

            const ctx = document.getElementById('rateChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: `Exchange rate for ${from_currency_value} to ${to_currency_value}`,
                        data: rates,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: false
                        }
                    }
                }
            });
        })
        .catch(err => alert('Error fetching historical data.'));
}

const translations = {
    en: {
        exchangeNow: "Exchange my money now!",
        exchangeRate: "Exchange Rate:",
        conversionHistory: "Conversion History",
    },
    fr: {
        exchangeNow: "Échanger mon argent maintenant!",
        exchangeRate: "Taux de change:",
        conversionHistory: "Historique des conversions",
    },
    es: {
        exchangeNow: "¡Intercambia mi dinero ahora!",
        exchangeRate: "Tipo de cambio:",
        conversionHistory: "Historial de conversiones",
    }
};

function setLanguage(language) {
    document.getElementById("exchange_button").textContent = translations[language].exchangeNow;
    document.querySelector(".exchange").textContent = translations[language].exchangeRate;
    document.querySelector("#conversion-history h3").textContent = translations[language].conversionHistory;
}

document.getElementById("language-selector").addEventListener("change", (e) => {
    setLanguage(e.target.value);
});

async function getHistoricalRates(fromCurrency, toCurrency) {
    const today = new Date();
    const dates = [];
    const rates = [];

    // Get rates for the past 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        dates.push(formattedDate);
    }

    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/b88b5967d64b35931fb025f7/latest/${fromCurrency}`);
        const data = await response.json();
        const rate = data.conversion_rates[toCurrency];
        
        // Simulate historical data with small variations
        // (since the free API doesn't provide historical data)
        rates.push(...dates.map(() => {
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            return (rate * (1 + variation)).toFixed(4);
        }));

        return { dates, rates };
    } catch (error) {
        console.error('Error fetching historical rates:', error);
        return { dates: [], rates: [] };
    }
}

let rateChart = null; // Store chart instance globally

async function updateChart(fromCurrency, toCurrency) {
    const { dates, rates } = await getHistoricalRates(fromCurrency, toCurrency);
    
    const ctx = document.getElementById('rateChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (rateChart) {
        rateChart.destroy();
    }

    // Create new chart
    rateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `${fromCurrency} to ${toCurrency} Exchange Rate`,
                data: rates,
                borderColor: '#ffd662ff',
                backgroundColor: 'rgba(255, 214, 98, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'white'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'white'
                    }
                }
            }
        }
    });
}

from_currency.addEventListener('change', () => {
    if (input_amount.value) {
        calculate();
    }
});

to_currency.addEventListener('change', () => {
    if (input_amount.value) {
        calculate();
    }
});

window.addEventListener('load', () => {
    updateChart(from_currency.value, to_currency.value);
});
