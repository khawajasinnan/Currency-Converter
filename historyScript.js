document.addEventListener('DOMContentLoaded', function() {
    console.log('History page loaded');
    displayHistory();
    
    // Add clear history functionality
    const clearButton = document.getElementById('clear-history');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all conversion history?')) {
                localStorage.removeItem('conversionHistory');
                displayHistory();
            }
        });
    }
});

function displayHistory() {
    console.log('Displaying history...');
    const historyList = document.getElementById('history-list');
    if (!historyList) {
        console.error('History list element not found!');
        return;
    }

    try {
        const history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        console.log('Retrieved history from localStorage:', history);
        
        if (history.length === 0) {
            console.log('No history found');
            historyList.innerHTML = '<tr><td colspan="6">No conversion history available</td></tr>';
            return;
        }

        // Sort history by timestamp in descending order (newest first)
        const sortedHistory = history.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        console.log('Sorted history:', sortedHistory);

        historyList.innerHTML = sortedHistory.map(item => `
            <tr>
                <td>${item.timestamp}</td>
                <td>${item.from}</td>
                <td>${item.to}</td>
                <td>${item.amount}</td>
                <td>${item.result}</td>
                <td>${item.rate ? parseFloat(item.rate).toFixed(4) : 'N/A'}</td>
            </tr>
        `).join('');
        console.log('History displayed successfully');
    } catch (e) {
        console.error('Error displaying history:', e);
        historyList.innerHTML = '<tr><td colspan="6">Error loading conversion history</td></tr>';
    }
} 