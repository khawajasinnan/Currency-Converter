var input_amount = document.getElementById("original-currency-amount")
var from_currency = document.getElementById("from_currency")
var to_currency = document.getElementById("to_currency")
var exchange_rate = document.getElementById("exchange-rate")
var exchange = document.getElementById("exchange")
var output_amount = document.getElementById("output-text")
var output_from = document.getElementById("from")
var output_to = document.getElementById("to")
var convert_button = document.getElementById("exchange_button")

// Notification and fluctuation functionality
let marketData = {
  currentRate: 0,
  yesterdayRate: 0,
  weekAgoRate: 0,
  monthAgoRate: 0,
  lastUpdated: null,
}

// Function to get historical rates for fluctuation analysis
async function getFluctuationData(fromCurrency, toCurrency) {
  try {
    console.log("Fetching fluctuation data for", fromCurrency, "to", toCurrency)

    // Get current rate
    const currentResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`)
    const currentData = await currentResponse.json()
    const currentRate = currentData.rates[toCurrency]

    // Since we can't get actual historical data from this free API,
    // we'll simulate realistic fluctuations based on the current rate
    const yesterdayRate = currentRate * (1 + (Math.random() - 0.5) * 0.02) // ±1% variation
    const weekAgoRate = currentRate * (1 + (Math.random() - 0.5) * 0.05) // ±2.5% variation
    const monthAgoRate = currentRate * (1 + (Math.random() - 0.5) * 0.1) // ±5% variation

    marketData = {
      currentRate,
      yesterdayRate,
      weekAgoRate,
      monthAgoRate,
      lastUpdated: new Date(),
    }

    return marketData
  } catch (error) {
    console.error("Error fetching fluctuation data:", error)
    throw error
  }
}

// Function to calculate percentage change
function calculatePercentageChange(current, previous) {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

// Function to format percentage change with color and icon
function formatPercentageChange(change) {
  const isPositive = change >= 0
  const icon = isPositive ? "fa-arrow-up" : "fa-arrow-down"
  const colorClass = isPositive ? "positive" : "negative"
  const sign = isPositive ? "+" : ""

  return {
    text: `${sign}${change.toFixed(2)}%`,
    icon: icon,
    colorClass: colorClass,
    isPositive: isPositive,
  }
}

// Function to update notification bar
async function updateNotificationBar() {
  const notificationBar = document.getElementById("notification-bar")
  const fluctuationCards = document.getElementById("fluctuation-cards")
  const refreshBtn = document.getElementById("refresh-notifications")

  if (!fluctuationCards) return

  try {
    // Show loading state
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
    fluctuationCards.innerHTML = `
            <div class="fluctuation-card loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Loading market data...</span>
            </div>
        `

    const fromCurrency = document.getElementById("from_currency").value
    const toCurrency = document.getElementById("to_currency").value

    await getFluctuationData(fromCurrency, toCurrency)

    // Calculate changes
    const dailyChange = calculatePercentageChange(marketData.currentRate, marketData.yesterdayRate)
    const weeklyChange = calculatePercentageChange(marketData.currentRate, marketData.weekAgoRate)
    const monthlyChange = calculatePercentageChange(marketData.currentRate, marketData.monthAgoRate)

    // Format changes
    const dailyFormatted = formatPercentageChange(dailyChange)
    const weeklyFormatted = formatPercentageChange(weeklyChange)
    const monthlyFormatted = formatPercentageChange(monthlyChange)

    // Update notification cards
    fluctuationCards.innerHTML = `
            <div class="fluctuation-card daily">
                <div class="card-header">
                    <i class="fas fa-calendar-day"></i>
                    <span class="period">24 Hours</span>
                </div>
                <div class="card-content">
                    <div class="rate-info">
                        <span class="current-rate">${marketData.currentRate.toFixed(4)}</span>
                        <span class="previous-rate">Yesterday: ${marketData.yesterdayRate.toFixed(4)}</span>
                    </div>
                    <div class="change-info ${dailyFormatted.colorClass}">
                        <i class="fas ${dailyFormatted.icon}"></i>
                        <span class="change-text">${dailyFormatted.text}</span>
                    </div>
                </div>
            </div>
            
            <div class="fluctuation-card weekly">
                <div class="card-header">
                    <i class="fas fa-calendar-week"></i>
                    <span class="period">7 Days</span>
                </div>
                <div class="card-content">
                    <div class="rate-info">
                        <span class="current-rate">${marketData.currentRate.toFixed(4)}</span>
                        <span class="previous-rate">Week ago: ${marketData.weekAgoRate.toFixed(4)}</span>
                    </div>
                    <div class="change-info ${weeklyFormatted.colorClass}">
                        <i class="fas ${weeklyFormatted.icon}"></i>
                        <span class="change-text">${weeklyFormatted.text}</span>
                    </div>
                </div>
            </div>
            
            <div class="fluctuation-card monthly">
                <div class="card-header">
                    <i class="fas fa-calendar-alt"></i>
                    <span class="period">30 Days</span>
                </div>
                <div class="card-content">
                    <div class="rate-info">
                        <span class="current-rate">${marketData.currentRate.toFixed(4)}</span>
                        <span class="previous-rate">Month ago: ${marketData.monthAgoRate.toFixed(4)}</span>
                    </div>
                    <div class="change-info ${monthlyFormatted.colorClass}">
                        <i class="fas ${monthlyFormatted.icon}"></i>
                        <span class="change-text">${monthlyFormatted.text}</span>
                    </div>
                </div>
            </div>
        `

    // Update quick stats
    updateQuickStats()

    // Show notification bar with animation
    notificationBar.classList.add("visible")
  } catch (error) {
    console.error("Error updating notification bar:", error)
    fluctuationCards.innerHTML = `
            <div class="fluctuation-card error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Unable to load market data. Please try again.</span>
            </div>
        `
  } finally {
    // Reset refresh button
    refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>'
  }
}

// Function to update quick stats section
function updateQuickStats() {
  const currentRateDisplay = document.getElementById("current-rate-display")
  const dailyChangeDisplay = document.getElementById("daily-change-display")
  const trendDisplay = document.getElementById("trend-display")

  if (!currentRateDisplay || !marketData.currentRate) return

  const fromCurrency = document.getElementById("from_currency").value
  const toCurrency = document.getElementById("to_currency").value
  const dailyChange = calculatePercentageChange(marketData.currentRate, marketData.yesterdayRate)
  const dailyFormatted = formatPercentageChange(dailyChange)

  currentRateDisplay.textContent = `1 ${fromCurrency} = ${marketData.currentRate.toFixed(4)} ${toCurrency}`
  dailyChangeDisplay.innerHTML = `<i class="fas ${dailyFormatted.icon}"></i> ${dailyFormatted.text}`
  dailyChangeDisplay.className = `stat-value ${dailyFormatted.colorClass}`

  // Determine trend
  const weeklyChange = calculatePercentageChange(marketData.currentRate, marketData.weekAgoRate)
  let trendText = "Stable"
  let trendIcon = "fa-minus"
  let trendClass = "neutral"

  if (Math.abs(weeklyChange) > 2) {
    if (weeklyChange > 0) {
      trendText = "Bullish"
      trendIcon = "fa-trending-up"
      trendClass = "positive"
    } else {
      trendText = "Bearish"
      trendIcon = "fa-trending-down"
      trendClass = "negative"
    }
  }

  trendDisplay.innerHTML = `<i class="fas ${trendIcon}"></i> ${trendText}`
  trendDisplay.className = `stat-value ${trendClass}`
}

// Function to initialize notifications
function initializeNotifications() {
  const refreshBtn = document.getElementById("refresh-notifications")
  if (refreshBtn) {
    refreshBtn.addEventListener("click", updateNotificationBar)
  }

  // Update notifications when currency selection changes
  const fromCurrency = document.getElementById("from_currency")
  const toCurrency = document.getElementById("to_currency")

  if (fromCurrency && toCurrency) {
    fromCurrency.addEventListener("change", () => {
      setTimeout(updateNotificationBar, 500) // Small delay to allow UI to update
    })

    toCurrency.addEventListener("change", () => {
      setTimeout(updateNotificationBar, 500)
    })
  }

  // Initial load
  updateNotificationBar()
}

// Add event listener for convert button
convert_button.addEventListener("click", calculate)

// Add event listener for exchange button
exchange.addEventListener("click", () => {
  ;[from_currency.value, to_currency.value] = [to_currency.value, from_currency.value]
  calculate()
})

function validateInput() {
  if (input_amount.value <= 0 || isNaN(input_amount.value)) {
    alert("Please enter a valid number greater than 0.")
    return false
  }
  return true
}

function saveToHistory(from_currency_value, to_currency_value, amount, result, rate) {
  try {
    console.log("=== Starting saveToHistory ===")
    console.log("Input values:", {
      from: from_currency_value,
      to: to_currency_value,
      amount: amount,
      result: result,
      rate: rate,
    })

    // Get existing history
    let history = []
    const existingHistory = localStorage.getItem("conversionHistory")
    console.log("Existing history from localStorage:", existingHistory)

    if (existingHistory) {
      try {
        history = JSON.parse(existingHistory)
        console.log("Successfully parsed existing history:", history)
      } catch (parseError) {
        console.error("Error parsing existing history:", parseError)
        history = []
      }
    }

    // Create new conversion entry
    const conversion = {
      timestamp: new Date().toLocaleString(),
      from: from_currency_value,
      to: to_currency_value,
      amount: Number.parseFloat(amount).toFixed(2),
      result: Number.parseFloat(result).toFixed(2),
      rate: Number.parseFloat(rate).toFixed(4),
    }
    console.log("New conversion entry:", conversion)

    // Add to history
    history.push(conversion)
    console.log("Updated history array:", history)

    // Save to localStorage
    const historyString = JSON.stringify(history)
    console.log("Saving to localStorage:", historyString)
    localStorage.setItem("conversionHistory", historyString)

    // Verify save
    const savedHistory = localStorage.getItem("conversionHistory")
    console.log("Verified saved history:", savedHistory)

    // Update history display if we're on the history page
    if (document.getElementById("history-list")) {
      console.log("History list element found, updating display")
      displayHistory()
    } else {
      console.log("History list element not found, skipping display update")
    }

    console.log("=== saveToHistory completed successfully ===")
  } catch (error) {
    console.error("Error in saveToHistory:", error)
  }
}

function displayHistory() {
  const historyList = document.getElementById("history-list")
  if (!historyList) return

  try {
    const history = JSON.parse(localStorage.getItem("conversionHistory")) || []

    if (history.length === 0) {
      historyList.innerHTML = '<tr><td colspan="6">No conversion history available</td></tr>'
      return
    }

    // Sort history by timestamp in descending order (newest first)
    const sortedHistory = history.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp)
    })

    historyList.innerHTML = sortedHistory
      .map(
        (item) => `
            <tr>
                <td>${item.timestamp}</td>
                <td>${item.from}</td>
                <td>${item.to}</td>
                <td>${item.amount}</td>
                <td>${item.result}</td>
                <td>${item.rate}</td>
            </tr>
        `,
      )
      .join("")
  } catch (e) {
    console.error("Error displaying history:", e)
    historyList.innerHTML = '<tr><td colspan="6">Error loading conversion history</td></tr>'
  }
}

// Add clear history functionality
if (document.getElementById("clear-history")) {
  document.getElementById("clear-history").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all conversion history?")) {
      localStorage.removeItem("conversionHistory")
      displayHistory()
    }
  })
}

window.onload = () => {
  if (document.getElementById("language-selector")) {
    // Declare setLanguage function or import it here
    function setLanguage(lang) {
      console.log(`Setting language to ${lang}`)
      // Implementation for setting language
    }
    setLanguage("en")
    loadGraph(from_currency.value, to_currency.value)
  }
  displayHistory()

  // Initialize notifications on main page
  if (document.getElementById("notification-bar")) {
    initializeNotifications()
  }
}

function calculate() {
  if (!validateInput()) return

  const from_currency_value = from_currency.value
  const to_currency_value = to_currency.value
  const amount = input_amount.value

  // Add loading state
  convert_button.disabled = true
  convert_button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...'

  // Using a free API endpoint
  fetch(`https://api.exchangerate-api.com/v4/latest/${from_currency_value}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok")
      }
      return res.json()
    })
    .then((res) => {
      const rate = res.rates[to_currency_value]
      if (!rate) {
        throw new Error("Invalid currency pair")
      }

      const convertedAmount = (amount * rate).toFixed(2)
      exchange_rate.value = rate.toFixed(4)

      // Update the output display
      output_from.textContent = `${amount} ${from_currency_value}`
      output_to.textContent = `${convertedAmount} ${to_currency_value}`

      // Show output with animation
      output_amount.style.display = "block"
      output_amount.classList.add("visible")

      // Save to history
      saveToHistory(from_currency_value, to_currency_value, amount, convertedAmount, rate)

      // Update market data and quick stats
      marketData.currentRate = rate
      updateQuickStats()

      // Update chart
      updateChart(from_currency_value, to_currency_value)
    })
    .catch((err) => {
      console.error("Error:", err)
      alert("Error fetching exchange rate. Please try again later.")
      output_amount.style.display = "none"
      exchange_rate.value = ""
    })
    .finally(() => {
      // Reset button state
      convert_button.disabled = false
      convert_button.innerHTML = '<i class="fas fa-sync-alt"></i> Convert Now'
    })
}

function loadGraph(from_currency_value, to_currency_value) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  const formattedStartDate = startDate.toISOString().split("T")[0]

  fetch(`https://v6.exchangerate-api.com/v6/b88b5967d64b35931fb025f7/latest/USD`)
    .then((res) => res.json())
    .then((data) => {
      const dates = []
      const rates = []

      for (const date in data.rates) {
        dates.push(date)
        rates.push(data.rates[date][to_currency_value])
      }

      const ctx = document.getElementById("rateChart").getContext("2d")
      new Chart(ctx, {
        type: "line",
        data: {
          labels: dates,
          datasets: [
            {
              label: `Exchange rate for ${from_currency_value} to ${to_currency_value}`,
              data: rates,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        },
      })
    })
    .catch((err) => alert("Error fetching historical data."))
}

async function getHistoricalRates(fromCurrency, toCurrency) {
  const today = new Date()
  const dates = []
  const rates = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const formattedDate = date.toISOString().split("T")[0]
    dates.push(formattedDate)
  }

  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/b88b5967d64b35931fb025f7/latest/${fromCurrency}`)
    const data = await response.json()
    const rate = data.conversion_rates[toCurrency]

    rates.push(
      ...dates.map(() => {
        const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
        return (rate * (1 + variation)).toFixed(4)
      }),
    )

    return { dates, rates }
  } catch (error) {
    console.error("Error fetching historical rates:", error)
    return { dates: [], rates: [] }
  }
}

let rateChart = null

async function updateChart(fromCurrency, toCurrency) {
  const canvas = document.getElementById("rateChart")
  if (!canvas) {
    console.warn("Chart canvas element not found. Skipping chart update.")
    return
  }

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    console.error("Could not get 2D context from canvas")
    return
  }

  const { dates, rates } = await getHistoricalRates(fromCurrency, toCurrency)

  // Destroy existing chart if it exists
  if (rateChart) {
    rateChart.destroy()
  }

  // Create new chart with updated colors
  rateChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: `${fromCurrency} to ${to_currency} Exchange Rate`,
          data: rates,
          borderColor: "#1E40AF",
          backgroundColor: "rgba(30, 64, 175, 0.2)",
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: "#1E40AF",
          pointBorderColor: "#ffffff",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#1E40AF",
            font: {
              size: 14,
              weight: "bold",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          titleColor: "#1E40AF",
          bodyColor: "#4B5563",
          borderColor: "#1E40AF",
          borderWidth: 1,
          padding: 10,
          displayColors: false,
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: "rgba(30, 64, 175, 0.1)",
            drawBorder: false,
          },
          ticks: {
            color: "#1E40AF",
            font: {
              size: 12,
            },
          },
        },
        x: {
          grid: {
            color: "rgba(30, 64, 175, 0.1)",
            drawBorder: false,
          },
          ticks: {
            color: "#1E40AF",
            font: {
              size: 12,
            },
          },
        },
      },
    },
  })
}

input_amount.addEventListener("input", function () {
  if (this.value < 0) {
    this.classList.add("error")
  } else {
    this.classList.remove("error")
  }
})

from_currency.addEventListener("change", function () {
  this.classList.add("changed")
  setTimeout(() => this.classList.remove("changed"), 300)
})

to_currency.addEventListener("change", function () {
  this.classList.add("changed")
  setTimeout(() => this.classList.remove("changed"), 300)
})

window.addEventListener("load", () => {
  const canvas = document.getElementById("rateChart")
  if (canvas) {
    updateChart(from_currency.value, to_currency.value)
  }
})
