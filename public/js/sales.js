
// Sample sales data for demonstration
const salesData = [
    { id: "ORD005", date: "2025-08-16", total: 300.00, status: "pending" },
    { id: "ORD004", date: "2025-08-15", total: 45.00, status: "shipped" },
    { id: "ORD003", date: "2025-08-14", total: 85.00, status: "delivered" },
    { id: "ORD002", date: "2025-08-13", total: 120.00, status: "delivered" },
    { id: "ORD001", date: "2025-08-12", total: 250.00, status: "shipped" }
];

const metricsGrid = document.getElementById('metrics-grid');
const salesTableBody = document.getElementById('sales-table-body');
const statusMessageEl = document.getElementById('status-message');

// Function to calculate and render metrics
function renderMetrics(data) {
    const totalRevenue = data.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = data.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const metrics = [
        { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
        { label: "Total Orders", value: totalOrders },
        { label: "Average Order Value", value: `$${averageOrderValue.toFixed(2)}` }
    ];

    metricsGrid.innerHTML = ''; // Clear existing metrics
    metrics.forEach(metric => {
        const card = document.createElement('div');
        card.classList.add('metric-card');
        card.innerHTML = `
                    <div class="metric-value">${metric.value}</div>
                    <div class="metric-label">${metric.label}</div>
                `;
        metricsGrid.appendChild(card);
    });
}

// Function to render the sales table
function renderSalesTable(data) {
    salesTableBody.innerHTML = ''; // Clear existing content
    if (data.length === 0) {
        showStatusMessage('No sales data available.');
        return;
    }

    data.forEach(sale => {
        const row = document.createElement('tr');
        row.classList.add('sales-table-row');
        const statusClass = `status-${sale.status.toLowerCase()}`;
        row.innerHTML = `
                    <td>${sale.id}</td>
                    <td>${sale.date}</td>
                    <td>$${sale.total.toFixed(2)}</td>
                    <td><span class="status-badge ${statusClass}">${sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}</span></td>
                `;
        salesTableBody.appendChild(row);
    });
    showStatusMessage('');
}

// Function to render the sales chart
function renderSalesChart(data) {
    const ctx = document.getElementById('salesChart').getContext('2d');

    // Extract dates and totals
    const labels = data.map(d => d.date).reverse();
    const totals = data.map(d => d.total).reverse();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Sales ($)',
                data: totals,
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderColor: '#a855f7',
                borderWidth: 2,
                pointBackgroundColor: '#a855f7',
                pointBorderColor: '#fff',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#d1d5db',
                        callback: function (value) {
                            return `$${value}`;
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#d1d5db'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#d1d5db'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#a855f7',
                    borderWidth: 1
                }
            }
        }
    });
}

// Function to show status messages
function showStatusMessage(message) {
    if (message) {
        statusMessageEl.textContent = message;
        statusMessageEl.style.display = 'block';
    } else {
        statusMessageEl.style.display = 'none';
    }
}

// Initial render on page load
window.onload = () => {
    renderMetrics(salesData);
    renderSalesTable(salesData);
    renderSalesChart(salesData);
};
