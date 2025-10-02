
// Sample order data for demonstration
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
                   <td>${order._id.substring(0, 10)}</td>
                    <td>${order.created_by.username}</td>
                    <td>${order.placed_at.split('T')[0]}</td>
                    <td><span class="status-badge ${statusClass}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                    <td>$${order.total}</td>
                    <td>
                        <div class="action-buttons">
                           <button class="action-button status-button" onclick="changeStatus('${order._id}')">Change Status</button>
                        </div>
                         <form action="/order/${order._id}?_method=PUT" method="POST" class='options_status' id='${order._id}'>
                        <button type="submit" name="status" value="Pending" class="status_change_button">Pending</button>
                        <button type="submit" name="status" value="Shipped" class="status_change_button">Shipped</button>
                        <button type="submit" name="status" value="Delivered" class="status_change_button">Delivered</button>
                    </form>
                    </td>
                 
                `;
        orderTableBody.appendChild(row);
    });
    showStatusMessage('');
    //    <a href='/order/${order._id}' class="action-button view-button">View</a>
    //<button class="action-button cancel-button" onclick="cancelOrder('${order._id}')">Cancel</button>
}

// Placeholder functions for admin actions
function viewOrder(orderId) {
    console.log('Viewing details for order:', orderId);
    alert(`View button clicked for Order ID: ${orderId}`);
}

function changeStatus(orderId) {
    const form=document.getElementById(orderId)
    form.style.display='flex'
   
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
        const matchesId = order._id.toLowerCase().includes(searchTerm);
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
