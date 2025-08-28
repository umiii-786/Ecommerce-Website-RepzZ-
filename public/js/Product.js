

let currentCategory = 'All';
categories.unshift('All')
const productGrid = document.getElementById('product-grid');
const categoryButtonsContainer = document.getElementById('category-buttons');
const main = document.getElementsByTagName('main')[0]
let initial_pointer = 0
let final_pointer = 10
// console.log('ma run hoya ')

function renderCategoryButtons() {
    categoryButtonsContainer.innerHTML = '';
    console.log(currentCategory)
    console.log(categories)
    for (let i = 0; i < categories.length; i++) {

        const btn = document.createElement('button');
        let className = categories[i] == currentCategory ? 'active' : ''
        let classes = `category-button ${className}`;
        btn.className = classes;
        btn.textContent = categories[i];
        btn.addEventListener('click', () => renderProducts(categories[i]));
        categoryButtonsContainer.appendChild(btn);
    }
    console.log(categoryButtonsContainer)

}

let productsToRender = []
function renderProducts(category) {
    if(allProducts.length>0){
            currentCategory = category;
            console.log('current category is ', currentCategory)
            renderCategoryButtons();
            console.log('category is ', category)
            if (category == 'All') {
                console.log('if runned')
                productsToRender = allProducts
            }
            else {
                console.log('else runned')
                productsToRender = FindProductsByCategory(category)
            }
            initial_pointer = 0
            final_pointer = 10
            ListLimitedProducts(category)
        }

}

function createButton(text, callback) {
    const Btn = document.createElement('button');
    Btn.className = "category-button";
    Btn.textContent = text;
    Btn.addEventListener('click', callback);
    return Btn

}



function ListLimitedProducts(category) {
    const buttons = document.querySelector('.next_previous_button_div')
    buttons === null ? "" : buttons.remove();    // .remove()
    productGrid.innerHTML = '';
    console.log('listing category', category)
    console.log('listing product', productsToRender)
    // main.innerHTML=''
    if (productsToRender && productsToRender.length > 0) {
        if (productsToRender.length < 10) {
            final_pointer = productsToRender.length
        }
        for (let i = initial_pointer; i < final_pointer; i++) {

            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                        <img src="${productsToRender[i].img_url}" alt="${productsToRender[i].title}" class="product-image">
                        <div class="product-details">
                            <h3 class="product-name">${productsToRender[i].title}</h3>
                            <div class="product-info">
                                <span class="product-price">$${productsToRender[i].price}</span>
                                <button class="add-to-cart-btn" onclick='addToCart(${JSON.stringify(productsToRender[i])})'>Add to Cart</button>
                            </div>
                        </div>
                    `;
            productGrid.appendChild(card);
        }
        console.log(main)
        const navDiv = document.createElement('div');
        navDiv.className = "next_previous_button_div";
        let nextBtn=createButton('Next', next)
        let prevBtn=createButton('Previous', previous)
        console.log(nextBtn)
        console.log(prevBtn)
        navDiv.appendChild(prevBtn);
        navDiv.appendChild(nextBtn);
        main.appendChild(navDiv);
        

    } else {
        productGrid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #9ca3af;">No products found for this category.</p>`;
    }
}


function next() {
    const totalProducts_count = productsToRender.length
    let subtract_result = totalProducts_count - final_pointer
    if (subtract_result < 10) {
        initial_pointer = final_pointer
        final_pointer = final_pointer + subtract_result
    }
    else if (subtract_result == 0) return
    else {
        initial_pointer = final_pointer
        final_pointer = final_pointer + 10
    }
    ListLimitedProducts()
}

function previous() {
    if (initial_pointer == 0) return
    let remainder = final_pointer % 10
    if (remainder = 0) final_pointer = final_pointer - 10
    else final_pointer = final_pointer - remainder
    ListLimitedProducts()
}

renderProducts('All')

function FindProductsByCategory(targetCategory) {
    // console.log('filter Kr rha ha ')
    filterCategory = allProducts.filter((product) => { return product.subCategory == targetCategory })
    return filterCategory
}


// let cart=[{}]
// function toggleCartModal() {
//     const cartModal = document.getElementById('cart-modal');
//     cartModal.classList.toggle('visible');
//     renderCart();
// }

// function addToCart(product) {
//     product=JSON.parse(product)
//     console.log(product)
//     // const existingProduct = cart.find(item => item.id === product.id);
//     // if (existingProduct) {
//     //     existingProduct.quantity++;
//     // } else {
//     //     cart.push({ ...product, quantity: 1 });
//     // }
//     // renderCart();
//     // toggleCartModal();
// }

// function updateQuantity(productId, change) {
//     const product = cart.find(item => item.id === productId);
//     if (product) {
//         product.quantity += change;
//         if (product.quantity <= 0) {
//             removeFromCart(productId);
//         }
//     }
//     renderCart();
// }

// function removeFromCart(productId) {
//     cart = cart.filter(item => item.id !== productId);
//     renderCart();
// }

// function clearCart() {
//     cart = [];
//     renderCart();
// }

// function renderCart() {
//     const container = document.getElementById('cart-items-container');
//     const totalItemsEl = document.getElementById('cart-item-count');
//     const totalPriceEl = document.getElementById('cart-total-price');

//     container.innerHTML = ''; // Clear previous items
//     let totalItems = 0;
//     let totalPrice = 0;

//     if (cart.length === 0) {
//         container.innerHTML = '<p style="text-align:center; color:#9ca3af;">Your cart is empty.</p>';
//     } else {
//         cart.forEach(item => {
//             const itemElement = document.createElement('div');
//             itemElement.className = 'cart-item';
//             itemElement.innerHTML = `
//                         <img src="${item.image}" alt="${item.name}">
//                         <div class="cart-item-details">
//                             <h4>${item.name}</h4>
//                             <p>$${item.price}</p>
//                         </div>
//                         <div class="cart-item-controls">
//                             <button class="quantity-button" onclick="updateQuantity('${item.id}', -1)">
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>
//                             </button>
//                             <span style="width:1.5rem; text-align:center;">${item.quantity}</span>
//                             <button class="quantity-button" onclick="updateQuantity('${item.id}', 1)">
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
//                             </button>
//                             <button class="remove-button" onclick="removeFromCart('${item.id}')">
//                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
//                             </button>
//                         </div>
//                     `;
//             container.appendChild(itemElement);

//             totalItems += item.quantity;
//             totalPrice += item.price * item.quantity;
//         });
//     }

//     totalItemsEl.textContent = `Total (${totalItems} items)`;
//     totalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
// }



