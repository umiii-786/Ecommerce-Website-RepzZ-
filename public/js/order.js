
// Sample order data for demonstration
const allOrders = [
    { id: "ORD001", customer: "Jane Doe", date: "2025-08-15", status: "pending", total: 250.00 },
    { id: "ORD002", customer: "John Smith", date: "2025-08-14", status: "shipped", total: 120.00 },
    { id: "ORD003", customer: "Alice Johnson", date: "2025-08-13", status: "delivered", total: 85.00 },
    { id: "ORD004", customer: "Bob Williams", date: "2025-08-12", status: "cancelled", total: 45.00 },
    { id: "ORD005", customer: "Charlie Brown", date: "2025-08-11", status: "pending", total: 300.00 }
];

const orderIdInput = document.getElementById('order-id');
const statusSelect = document.getElementById('status');
const orderTableBody = document.getElementById('order-table-body');
const statusMessageEl = document.getElementById('status-message');

function renderOrders(orders) {
    orderTableBody.innerHTML = ''; // Clear previous orders
    if (orders.length === 0) {
        showStatusMessage('No orders found matching your criteria.');
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.classList.add('order-table-row');
        const statusClass = `status-${order.status.toLowerCase()}`;
        row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${order.date}</td>
                    <td><span class="status-badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                    <td>$${order.total.toFixed(2)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-button view-button" onclick="viewOrder('${order.id}')">View</button>
                            <button class="action-button status-button" onclick="changeStatus('${order.id}')">Change Status</button>
                            <button class="action-button cancel-button" onclick="cancelOrder('${order.id}')">Cancel</button>
                        </div>
                    </td>
                `;
        orderTableBody.appendChild(row);
    });
    showStatusMessage('');
}

// Placeholder functions for admin actions
function viewOrder(orderId) {
    console.log('Viewing details for order:', orderId);
    alert(`View button clicked for Order ID: ${orderId}`);
}

function changeStatus(orderId) {
    console.log('Changing status for order:', orderId);
    alert(`Change Status button clicked for Order ID: ${orderId}`);
}

function cancelOrder(orderId) {
    console.log('Cancelling order:', orderId);
    alert(`Cancel button clicked for Order ID: ${orderId}`);
}

// Function to filter orders
function filterOrders() {
    const searchTerm = orderIdInput.value.toLowerCase();
    const selectedStatus = statusSelect.value.toLowerCase();

    const filtered = allOrders.filter(order => {
        const matchesId = order.id.toLowerCase().includes(searchTerm);
        const matchesStatus = !selectedStatus || order.status.toLowerCase() === selectedStatus;
        return matchesId && matchesStatus;
    });

    renderOrders(filtered);
}

orderIdInput.addEventListener('input', filterOrders);
statusSelect.addEventListener('change', filterOrders);

// Initial render on page load
window.onload = () => {
    renderOrders(allOrders);
};

// Function to show status messages
function showStatusMessage(message) {
    if (message) {
        statusMessageEl.textContent = message;
        statusMessageEl.style.display = 'block';
    } else {
        statusMessageEl.style.display = 'none';
    }
}
