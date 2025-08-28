        // Chart drawing functions
        function drawChart(canvasId, type, data) {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            if (type === 'bar') {
                const barWidth = 40;
                const spacing = 30;
                const maxVal = Math.max(...data);
                ctx.fillStyle = '#a855f7';

                data.forEach((value, index) => {
                    const barHeight = (value / maxVal) * height;
                    const x = index * (barWidth + spacing) + 20;
                    const y = height - barHeight;
                    ctx.fillRect(x, y, barWidth, barHeight);
                });
            } else if (type === 'line' || type === 'area') {
                const points = data.map((val, i) => ({
                    x: (i / (data.length - 1)) * width,
                    y: height - (val / Math.max(...data)) * height
                }));

                // Draw area fill
                if (type === 'area') {
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, height);
                    points.forEach(p => ctx.lineTo(p.x, p.y));
                    ctx.lineTo(points[points.length - 1].x, height);
                    ctx.closePath();

                    const gradient = ctx.createLinearGradient(0, 0, 0, height);
                    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
                    gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }

                // Draw line
                ctx.strokeStyle = '#a855f7';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.stroke();

                // Draw points
                ctx.fillStyle = '#a855f7';
                points.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                    ctx.fill();
                });

            } else if (type === 'doughnut') {
                const total = data.reduce((sum, val) => sum + val.value, 0);
                let startAngle = 0;
                const centerX = width / 2;
                const centerY = height / 2;
                const radius = Math.min(centerX, centerY) * 0.8;
                const innerRadius = radius * 0.6;

                data.forEach(slice => {
                    const angle = (slice.value / total) * Math.PI * 2;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
                    ctx.arc(centerX, centerY, innerRadius, startAngle + angle, startAngle, true);
                    ctx.closePath();
                    ctx.fillStyle = slice.color;
                    ctx.fill();
                    startAngle += angle;
                });

                // Add center text
                ctx.fillStyle = '#fff';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '700 36px Inter, sans-serif';
                ctx.fillText('80%', centerX, centerY - 10);
                ctx.font = '400 12px Inter, sans-serif';
                ctx.fillText('Profit', centerX, centerY + 15);
            }
        }

        // Data for the charts
        const levelData = [60, 80, 50, 90, 70];
        const visitorsData = [100, 150, 200, 180, 250, 300, 350, 400, 380, 450, 500, 480];
        const fulfillmentData = [200, 350, 300, 400, 550, 500, 600, 650, 700];
        const earningsData = [
            { value: 80, color: '#a855f7' },
            { value: 20, color: '#1f2937' }
        ];

        // Draw charts on page load
        window.onload = function () {
            drawChart('levelChart', 'bar', levelData);
            drawChart('visitorsChart', 'line', visitorsData);
            drawChart('fulfillmentChart', 'area', fulfillmentData);
            drawChart('earningsChart', 'doughnut', earningsData);
        };