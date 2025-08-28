
function toggleCartModal() {
    const cartModal = document.getElementById('cart-modal');
    cartModal.classList.toggle('visible');
    // console.log('hoya visisble')
    renderCart();
}

function addToCart(product) {
    let cart = getCart()
    if (cart == null) {
        cart = []
        cart.push({ ...product, quantity: 1 });
        // setCart(cart)
    }
    else {
        const existingProduct = cart.find(item => item.id === product.id);
        console.log(existingProduct)
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
            // setCart(cart)
        }
        
        document.querySelector('.countCartItem').innerHTML=cart.length
        setCart(cart)
        renderCart();
        toggleCartModal();
    }

}
function updateQuantity(productId, change) {
    let cart =JSON.parse(localStorage.getItem('cart'))
    // console.log(cart)
    cart=cart.map((item)=>{
            if(item._id === productId){
                item.quantity += change;
                console.log(item.quantity)
                if (item.quantity <= 0) item.quantity=1
                return item

            }
            return item
    })
    setCart(cart)
    renderCart();
}

function removeFromCart(productId) {
    let cart=getCart()
    cart = cart.filter(item => item._id !== productId);
    document.querySelector('.countCartItem').innerHTML=cart.length
    setCart(cart)
    renderCart();
}

function getCart(){
    console.log('get kr rhi hn ')
    let cart=localStorage.getItem('cart')
    console.log(cart)
    cart=cart!=null?JSON.parse(cart):null
    console.log('after ',cart)
    return cart
}

function setCart(cart){
    localStorage.setItem('cart',JSON.stringify(cart))
}

function clearCart() {
    localStorage.setItem('cart',null)
    document.querySelector('.countCartItem').innerHTML='0'
    renderCart();
}

function renderCart() {
    console.log('render ma hn')
    let cart =getCart()
    console.log(typeof(cart))
    console.log(cart)
    const container = document.getElementById('cart-items-container');
    const totalItemsEl = document.getElementById('cart-item-count');
    const totalPriceEl = document.getElementById('cart-total-price');

    container.innerHTML = ''; // Clear previous items
    let totalItems = 0;
    let totalPrice = 0;

    if (!cart || cart.length == 0) {
        container.innerHTML = '<p style="text-align:center; color:#9ca3af;">Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                        <img src="${item.img_url}" alt="${item.title}">
                        <div class="cart-item-details">
                            <h4>${item.title}</h4>
                            <p>$${item.price}</p>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-button" onclick="updateQuantity('${item._id}', -1)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>
                            </button>
                            <span style="width:1.5rem; text-align:center;">${item.quantity}</span>
                            <button class="quantity-button" onclick="updateQuantity('${item._id}', 1)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            </button>
                            <button class="remove-button" onclick="removeFromCart('${item._id}')">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                        </div>
                    `;
            container.appendChild(itemElement);

            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
        });
    }

    totalItemsEl.textContent = `Total (${totalItems} items)`;
    totalPriceEl.textContent = `$${totalPrice.toFixed(2)}`;
}

function checkOut(){
        let cart= getCart()
        if(!cart || cart.length==0)return
        let checkOutItem=document.getElementById('checkOutItem')
        console.log(checkOutItem)
        checkOutItem.value=JSON.stringify(cart)
        // /create-checkout-session
        document.getElementById('checkoutForm').submit()
}
