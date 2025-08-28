    const historyLog = [
            {
                id: 1,
                event: 'Order Status Update',
                description: 'Order #ORD1234 status changed to "Shipped".',
                timestamp: 'August 16, 2025 - 10:30 AM',
                icon: '📦', // Package icon
                type: 'order'
            },
            {
                id: 2,
                event: 'New Product Added',
                description: 'New product "Cosmic Sneakers" was added to the catalog.',
                timestamp: 'August 15, 2025 - 04:15 PM',
                icon: '👟', // Shoe icon
                type: 'product'
            },
            {
                id: 3,
                event: 'Admin Login',
                description: 'Administrator "Jane Doe" logged in to the dashboard.',
                timestamp: 'August 15, 2025 - 09:00 AM',
                icon: '🔑', // Key icon
                type: 'user'
            },
            {
                id: 4,
                event: 'Message Received',
                description: 'New customer message from "John Smith" received.',
                timestamp: 'August 14, 2025 - 02:45 PM',
                icon: '💬', // Message icon
                type: 'message'
            },
            {
                id: 5,
                event: 'Product Price Updated',
                description: 'Price for "Nebula Hoodie" was updated from $70 to $75.',
                timestamp: 'August 14, 2025 - 11:20 AM',
                icon: '👕', // T-shirt icon
                type: 'product'
            },
            {
                id: 6,
                event: 'Order Status Update',
                description: 'Order #ORD1233 status changed to "Delivered".',
                timestamp: 'August 13, 2025 - 09:50 AM',
                icon: '📦',
                type: 'order'
            },
        ];

        const timelineContainerEl = document.getElementById('timeline-container');
        const statusMessageEl = document.getElementById('status-message');

        // Function to render the history log
        function renderHistory() {
            timelineContainerEl.innerHTML = ''; // Clear existing content
            if (historyLog.length === 0) {
                showStatusMessage('No history to display.');
                return;
            }

            historyLog.forEach(log => {
                const item = document.createElement('div');
                item.classList.add('timeline-item');
                item.innerHTML = `
                    <div class="timeline-header">
                        <div class="event-icon-container">
                            <span class="event-icon">${log.icon}</span>
                        </div>
                        <span class="event-title">${log.event}</span>
                    </div>
                    <div class="event-description">${log.description}</div>
                    <div class="event-timestamp">${log.timestamp}</div>
                `;
                timelineContainerEl.appendChild(item);
            });
            showStatusMessage('');
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
            renderHistory();
        };
