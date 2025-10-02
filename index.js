require('dotenv').config();
const mongoConnect = require('./connection.js')
const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const expressSesison = require('express-session')
const flash = require('connect-flash')
const cluster = require('cluster')
const os = require('os')
const path = require('path')
const engine = require('ejs-mate')
const no_of_cpus = os.cpus().length
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const { MyError } = require('./utils/MyError')
const { User } = require('./model/user')
const { Order } = require('./model/order')
const { Product } = require('./model/product')
const { Review } = require('./model/review.js')
const { Chat } = require('./model/chat')

const saltRounds = 10;
const { user_schema_validator } = require('./server_validation/user_schema_validation')
const { product_schema_validator } = require('./server_validation/product_schema_validation')
const { review_schema_validation } = require('./server_validation/review_schema_validation.js')

const { ConvertTokenToUser, User_To_Token } = require('./auth/authentication.js')
const cookieParser = require('cookie-parser')
const { Server } = require('socket.io')
const io = new Server(server)
// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
const { Resend } = require('resend');
// const { SocketAddress } = require('net');
const resend = new Resend(process.env.RESEND_API_KEY)
// mongoose.connect('mongodb://127.0.0.1:27017/ecommers_db').then(() => console.log('connected to db'))
const { createClient } = require('redis')
// // const client=createClient()
// const client = createClient({
//     username: 'default',
//     password: '4vVHpJgD33SndSKYXqVnieV9njfBLaQ8',
//     socket: {
//         host: 'redis-15197.crce206.ap-south-1-1.ec2.redns.redis-cloud.com',
//         port: 15197
//     }
// });

// client.connect().then(()=> console.log('connected to redis server'))
// if(cluster.isPrimary){
//     console.log(`Primary ${process.pid} is running`);

//     for (let i = 0; i < no_of_cpus; i++) {
//         cluster.fork()
//     }
// }

// else{
let users = {}
let adminSocketId = null

io.on('connection', (socket) => {

    socket.on('register_user', (userID) => {
        console.log('user registered')
        users[socket.id] = userID
        console.log(users)
    })

    socket.on("register_admin", (adminId) => {
        adminSocketId = socket.id;
        console.log("✅ Admin connected:", adminSocketId);
    });

    socket.on('message_for_admin', async ({ to, message }) => {
        if (to == 'Admin') {
            let userChat = await Chat.findOne({ 'userid': users[socket.id] })
                .populate('userid')
            let message_object = {
                sender: 'user',
                message: message,
                status: 'unread'
            }

            if (!userChat) {
                let user = await User.findById(users[socket.id])
                userChat = new Chat({ userid: user })
            }

            userChat.last_message = message
            userChat.updated_at = Date.now()
            userChat.messages.push(message_object)
            await userChat.save()
            io.to(adminSocketId).emit("user_message", { from: socket.id, userChat: userChat });

        }
    })

    socket.on('admin_response', async ({ to, message }) => {
        let userChat = await Chat.findOne({ 'userid': to })
            .populate('userid')
        let message_object = {
            sender: 'admin',
            message: message,
            status: 'unread'
        }
        console.log(userChat, ' userchat')
        if (!userChat) {
            userChat = new Chat({ userid: users[socket.id] })
        }
        let clientSocket_id = ''
        if (Object.values(users).includes(to)) {
            clientSocket_id = Object.keys(users).find(key => users[key] === to);
            message_object['status'] = 'read'
        }

        userChat.last_message = message
        userChat.updated_at = Date.now()
        userChat.messages.push(message_object)
        await userChat.save()
        console.log(userChat)


        console.log(clientSocket_id)
        console.log(userChat)
        if (message_object['status'] == 'read') {
            console.log('emit hoya admin ki trf sa ')
            io.to(clientSocket_id).emit("admin_message", { userChat: userChat });

        }
    })

});

const methodOverride = require('method-override');
app.set('view engine', 'ejs');
app.engine('ejs', engine)
app.set('views', path.join(__dirname, 'views'));
// app.use(express.json())

app.use((req, res, next) => {
    if (req.originalUrl === "/order") {
        next();
    } else {
        express.json()(req, res, next);
    }
});

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(flash())
app.use(methodOverride('_method'))
app.use(expressSesison({
    secret: 'hellooworld',
    resave: false,
    saveUninitialized: true,
}))

app.use((req, res, next) => {
    res.locals.error = req.flash('error')
    res.locals.success = req.flash('success')
    next()
})

app.use(ConvertTokenToUser)


// function CheckAdminLogin(req, res, next) {
//     let redirect_url = '/admin/login'
//     return IsLogin(req, res, next, redirect_url)
// }

// function CheckUserLogin(req, res, next) {
//     let redirect_url = '/user/login'
//     return IsLogin(req, res, next, redirect_url)
// }

// function IsLogin(req, res, next, redirect_url) {
//     console.log(req.user)
//     if (req.user) {
//         return next()
//     }
//     return res.redirect(redirect_url)
// }

function IsLogin(req, res, next) {
    console.log(req.user)
    if (req.user) {
        return next()
    }

    return res.redirect('/login')
}


async function IsAdmin(req, res, next) {
    if (req.user.Role == 'Admin') {
        return next()
    }
    // let redirect_url = req.get('Referrer').split('800')[0]
    return res.redirect('/login')
}

async function IsUser(req, res, next) {
    if (req.user.Role == 'User') {
       return next()
    }
    // let redirect_url = req.get('Referrer').split('800')[0]
    return res.redirect('/login')
}


async function authenticate_user(req, res, next) {
    console.log('request AI ')
    let redirect_url = req.get('Referrer').split('800')[1]
    console.log(req.get('Referrer').split('800'))
    console.log(redirect_url)
    const username = req.body.username || null
    const password = req.body.password || null
    const result = await User.findOne({ username: username })
    if (!result) {
        req.flash('error', 'Invalid Username')
        return res.redirect(redirect_url)
    }

    let check = await bcrypt.compare(password, result.password)
    if (!check) {
        req.flash('error', 'Invalid Password')
        return res.redirect(redirect_url)
    }
    req.user = result
    next()

}

function Validate_user(req, res, next) {
    const check = user_schema_validator.validate(req.body)
    console.log(check)
    if (check.error) {
        throw new MyError(400, check.error.details[0].message)
    }
    next()
}

function ReviewValidation(req, res, next) {
    console.log(req.params)
    const { id } = req.params
    req.body.productId = id
    req.body.createdby = req.user._id
    console.log(req.body)
    const check = review_schema_validation.validate(req.body)
    if (check.error) {
        throw new MyError(400, check.error.details[0].message)
    }
    next()
}

function Validate_Product(req, res, next) {
    req.body.available_sizes = req.body.available_sizes ? req.body.available_sizes.split(',') : []
    console.log(req.body)
    const check = product_schema_validator.validate(req.body)
    console.log(check)
    if (check.error) {
        throw new MyError(400, check.error.details[0].message)
    }
    next()
}

// User Routes 

app.get('/', (req, res) => {
    console.log(req.user)
    res.render('pages/index.ejs', { user: req.user })
})

app.get('/user_view/product/:category_name', async (req, res) => {
    let product_name = req.params.category_name
    console.log(product_name)
    product_name = product_name.charAt(0).toUpperCase() + product_name.slice(1);
    const AllProducts = await Product.find({ category: product_name })
    const categories = await Product.distinct('subCategory', { category: product_name })
    console.log('received ', AllProducts)
    return res.render('pages/Product.ejs', { category: product_name, AllProducts: AllProducts, categories: categories })
})


app.get('/login', (req, res) => {
    res.render('BackendPages/login.ejs')
})

app.post('/login', authenticate_user, async (req, res) => {
    const token = await User_To_Token(req.user)
    res.cookie('token', token)
    return res.redirect('/')
})

app.get('/register', (req, res) => {
    return res.render('BackendPages/register.ejs')
})

app.post('/register', Validate_user, async (req, res) => {
    const data = req.body
    const check_exist = await User.find({ username: data.username })
    if (check_exist.length > 0) {
        req.flash('error', 'user is Already Existed')
        return res.redirect('/user/login')
    }
    const hashResult = await bcrypt.hash(data.password, saltRounds)
    data.password = hashResult
    const result = await User.create(data)
    console.log('user created')
    req.flash('success', 'User Created Success Fully')
    return res.redirect('/user/login')
})

app.get('/logout', (req, res) => {
    if (req.user) {
        res.clearCookie("token");
    }
    return res.redirect('/')
})

app.get('/user/:id',IsLogin,IsUser,async(req, res) => {
    const orders=await Order.find({'created_by':req.user._id}).populate('created_by')
    const chats=await Chat.findOne({userid:req.user._id})
    console.log(orders)
    return res.render('pages/user_profile.ejs',{orders,chats})
})



app.post('/create-checkout-session', IsLogin, async (req, res) => {
    let items = JSON.parse(req.body.items)
    let itemsData = []
    for (let i = 0; i < items.length; i++) {

        let item = {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: items[i].title,
                    images: [items[i].img_url]
                },
                unit_amount: items[i].price * 100, // $50.00
            },
            quantity: items[i].quantity,
        }

        itemsData.push(item)

    }

    const session = await stripe.checkout.sessions.create({
        line_items: itemsData,
        mode: 'payment',
        success_url: `http://localhost:800/success`,
        cancel_url: `http://localhost:800/cancel`,
        metadata: {
            userId: req.user._id.toString()  // attach your user id
        }
    });
    res.redirect(303, session.url);
});

app.get('/success', async (req, res) => {
    console.log('success', req.body)
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'umiii215020@gmail.com',
        subject: 'Order Placed',
        html: '<p>Your Order Has been Placed Successfully  thanks your <strong>Placing Order</strong>!</p>'
    })
    res.render("pages/success.ejs")
})

app.post('/cancel', (req, res) => {
    console.log('cancel', req)
    res.send('failure')
})








// Backend URls;

// app.get('/admin/login', (req, res) => {
//     req.session.previous_url = req.url
//     res.render('BackendPages/login.ejs', { purpose: 'Admin' })
// })

// app.post('/admin/login', authenticate_user, async (req, res) => {
//     const token = await User_To_Token(req.user)
//     console.log(token)
//     res.cookie('token', token)
//     res.redirect('/dashboard')
// })

app.get('/dashboard',IsLogin,IsAdmin ,(req, res) => {
    res.render('BackendPages/dashboard.ejs')
})

app.get('/product', IsLogin,IsAdmin,(req, res) => {
    res.render('BackendPages/add_product.ejs')
})

app.post('/product',IsLogin, IsAdmin,Validate_Product, async (req, res) => {
    const product = await Product.create(req.body)
    req.flash('success', 'Product Added SuccessFully')
    return res.redirect('/product')
})

app.get('/product/manage', IsLogin ,IsAdmin,async (req, res) => {
    console.log(req.query)
    let filter = {}
    for (const key in req.query) {
        if (req.query[key]) {
            if (key == 'category' && req.query[key] == 'All') continue
            filter[key] = req.query[key]
        }
    }
    const AllProducts = await Product.find(filter)
    console.log(AllProducts)
    res.render('BackendPages/manage_Product.ejs', { AllProducts: AllProducts })
})

app.get('/product/:id', IsLogin,async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id)
    const reviews = await Review.find({ productId: id }).populate('createdby')
    console.log(id)
    console.log(reviews)
    console.log('in the particular product')
    return res.render('pages/each_product.ejs', { product, reviews })
})

app.get('/product/:id/edit', IsLogin,IsAdmin ,async (req, res) => {
    const { id } = req.params
    const product = await Product.findById(id)
    console.log(product)
    console.log('product edited ')
    res.render('BackendPages/edit_product.ejs', { product })
})

app.put('/product/:id',IsLogin,IsAdmin ,Validate_Product, async (req, res) => {
    const { prod_id } = req.params
    try {

        const updated_data = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
    } catch (error) {
        throw new MyError(500, 'Internal Server Error Occured')
    }

    console.log(updated_data)
    return res.redirect(`/product/${prod_id}`)
})

app.delete('/product/:id',IsLogin,IsAdmin, async (req, res) => {
    const { id } = req.params
    await Product.findByIdAndDelete(id)
    console.log(id)
    res.redirect('/product/manage')
})

app.post('/product/:id/review',IsLogin, IsUser ,ReviewValidation, async (req, res) => {
    const review = await Review.create(req.body)

    console.log(req.body)
    return res.redirect(`/product/${req.body.productId}`)
})

// 2. Stripe webhook (this is where you store in DB)
app.post('/order',express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`Webhook error: ${err.message}`);
        throw new MyError(400, err.message)
    }

    // Handle event type
    if (event.type === 'checkout.session.completed') {
        console.log('order completed ')
        const session = event.data.object;
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            {
                expand: ['line_items']
            }
        );

        let products_list = sessionWithLineItems.line_items.data
        let items = []
        let total_price = 0

        for (let i = 0; i < products_list.length; i++) {
            let singleItem = {}
            singleItem['item_name'] = products_list[i].description
            singleItem['price'] = products_list[i].amount_total / 100
            singleItem['quantity'] = products_list[i].quantity
            total_price += singleItem['price']

            console.log(singleItem)
            items.push(singleItem)  // ✅ use push in JS
        }

        console.log(items)
        console.log("Total Price:", total_price)
        const createdBy = session.metadata?.userId || null;
        let order_object = {
            "created_by":createdBy,  // make sure req.user exists
            "status": 'Pending',
            "total": total_price,
            "items": items
        };
        console.log("✅ Order Object:", order_object);

        try {

            const order = new Order(order_object)
            console.log('order is ', order)
            await order.save()
        }
        catch (err) {
            throw new MyError(500, 'Something Went Wrong with DataBase')
        }


    }

    console.log('order done')
    res.sendStatus(200);
});

app.put('/order/:id',IsLogin,IsAdmin,async(req,res)=>{
    const status=req.body.status
    console.log(req.body)
    const {id}=req.params
    console.log(id)
    const order=await Order.findByIdAndUpdate(id,{status:status})
    res.redirect('/order/manage')
})

app.get('/order/manage', IsLogin,IsAdmin,async(req, res) => {
    const orders=await Order.find({}).populate('created_by');
    console.log(orders)
    res.render('BackendPages/manage_order.ejs',{orders})
})

app.get('/sales', (req, res) => {
    res.render('BackendPages/salespage.ejs')
})
// async function getChat() {
//     const chats = await Chat.aggregate([
//         {
//             $addFields: {
//                 unreadCount: {
//                     $size: {
//                         $filter: {
//                             input: "$messages",
//                             as: "msg",
//                             cond: { $eq: ["$$msg.status", "unread"] }
//                         }
//                     }
//                 }
//             }
//         },
//         {
//             $sort: {
//                 unreadCount: -1,   // First priority: unread messages
//                 updated_at: -1     // Second: latest updated
//             }
//         },
//         {
//             $lookup: {
//                 from: "users",                // collection name in MongoDB
//                 localField: "userid",
//                 foreignField: "_id",
//                 as: "userid"
//             }
//         },
//         {
//             $unwind: "$userInfo"
//         },
//         {
//             $project: {
//                 last_message: 1,
//                 updated_at: 1,
//                 unreadCount: 1,
//                 messages: 1,   // ✅ include full conversation here
//                 "userInfo._id": 1,
//                 "userInfo.name": 1,
//                 "userInfo.email": 1,
//                 "userInfo.avatar": 1
//             }
//         }
//     ]);

//     return chats
// }
app.get('/messages',IsLogin,IsAdmin ,async (req, res) => {
    // let chats=await client.get('chat')
    // chats=JSON.parse(chats)
    // console.log(chats)
    // if(!chats){
    const chats = await Chat.find({}).populate('userid')
    console.log(chats)
    // client.set('chat',JSON.stringify(chats))
    // }
    // console.log(chats)
    res.render('BackendPages/customer_messages.ejs', { chats })
})

app.get('/history', (req, res) => {
    res.render('BackendPages/history.ejs')
})

app.use((err, req, res, next) => {
    const status = err.status || 404
    const message = err.message || 'Page Not Found'
    return res.render('BackendPages/Error.ejs', { status, message })
})
console.log(`another process ${process.pid} is running`);
server.listen(800, () => console.log('listening on Port 80'))