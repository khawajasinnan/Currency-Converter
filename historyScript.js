document.addEventListener('DOMContentLoaded', function() {
    displayHistory();
    
    // Add clear history functionality
    document.getElementById('clear-history').addEventListener('click', function() {
        localStorage.removeItem('conversionHistory');
        displayHistory();
    });
});

function displayHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    try {
        const history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        
        if (history.length === 0) {
            historyList.innerHTML = '<tr><td colspan="5">No conversion history available</td></tr>';
            return;
        }

        historyList.innerHTML = history.reverse().map(item => `
            <tr>
                <td>${item.timestamp}</td>
                <td>${item.from}</td>
                <td>${item.to}</td>
                <td>${item.amount}</td>
                <td>${item.result}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('Error displaying history:', e);
        historyList.innerHTML = '<tr><td colspan="5">Error loading conversion history</td></tr>';
    }
} 