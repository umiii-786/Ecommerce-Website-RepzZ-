
        // Sample data for demonstration
        const allProducts = [
            { id: 1, name: "Neon Runner", category: "Footwear", subcategory: "Running", price: "$120" },
            { id: 2, name: "Cyber Jacket", category: "Apparel", subcategory: "Outerwear", price: "$250" },
            { id: 3, name: "Quantum Gloves", category: "Accessories", subcategory: "Handwear", price: "$45" },
            { id: 4, name: "Galactic Sneakers", category: "Footwear", subcategory: "Casual", price: "$90" },
            { id: 5, name: "Fusion Hoodie", category: "Apparel", subcategory: "Hoodies", price: "$85" },
            { id: 6, name: "Astro Backpack", category: "Accessories", subcategory: "Bags", price: "$110" }
        ];

        // Mappings for subcategories
        const subcategories = {
            "apparel": ["Hoodies", "T-Shirts", "Outerwear"],
            "footwear": ["Running", "Casual", "Basketball"],
            "accessories": ["Handwear", "Bags", "Headwear"]
        };

        const categorySelect = document.getElementById('category');
        const subcategorySelect = document.getElementById('subcategory');
        const searchInput = document.getElementById('product-name');
        const searchButton = document.querySelector('.search-button');
        const productTableBody = document.getElementById('product-table-body');
        const statusMessageEl = document.getElementById('status-message');

        // Function to render products in a table
        function renderProducts(products) {
            productTableBody.innerHTML = ''; // Clear previous products
            if (products.length === 0) {
                showStatusMessage('No products found matching your criteria.');
                return;
            }

            products.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.subcategory}</td>
                    <td>${product.price}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-button view-button" onclick="viewProduct(${product.id})">View</button>
                            <button class="action-button edit-button" onclick="editProduct(${product.id})">Edit</button>
                            <button class="action-button delete-button" onclick="deleteProduct(${product.id})">Delete</button>
                        </div>
                    </td>
                `;
                productTableBody.appendChild(row);
            });
            showStatusMessage(''); // Clear message on success
        }
        
        // Placeholder function for viewing a product
        function viewProduct(productId) {
            console.log('Viewing product with ID:', productId);
            // Add logic here to display product details, e.g., in a modal.
            alert(`View button clicked for Product ID: ${productId}`);
        }
        
        // Placeholder function for editing a product
        function editProduct(productId) {
            console.log('Editing product with ID:', productId);
            // Here you would add the logic to show an edit form, pre-populate it with data, etc.
            alert(`Edit button clicked for Product ID: ${productId}`);
        }

        // Placeholder function for deleting a product
        function deleteProduct(productId) {
            console.log('Deleting product with ID:', productId);
            // Here you would add the logic to confirm deletion and then remove the product.
            alert(`Delete button clicked for Product ID: ${productId}`);
        }


        // Function to filter products
        function filterProducts() {
            const selectedCategory = categorySelect.value;
            const selectedSubcategory = subcategorySelect.value;
            const searchTerm = searchInput.value.toLowerCase();

            const filtered = allProducts.filter(product => {
                const matchesCategory = !selectedCategory || product.category.toLowerCase() === selectedCategory.toLowerCase();
                const matchesSubcategory = !selectedSubcategory || product.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
                const matchesName = product.name.toLowerCase().includes(searchTerm);
                return matchesCategory && matchesSubcategory && matchesName;
            });

            renderProducts(filtered);
        }

        // Populate subcategory dropdown based on category
        categorySelect.addEventListener('change', () => {
            const selectedCategory = categorySelect.value;
            subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
            if (selectedCategory in subcategories) {
                subcategories[selectedCategory].forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub;
                    option.textContent = sub;
                    subcategorySelect.appendChild(option);
                });
            }
        });

        // Event listener for search button
        searchButton.addEventListener('click', filterProducts);
        
        // Initial render on page load
        window.onload = () => {
            renderProducts(allProducts);
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

