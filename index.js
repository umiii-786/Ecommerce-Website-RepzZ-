require('dotenv').config();
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
const { MyError } = require('./utils/MyError')
const { User } = require('./model/user')
const { Order } = require('./model/order')
const { Product } = require('./model/product')
const { Chat } = require('./model/chat')
const saltRounds = 10;
const { user_schema_validator } = require('./server_validation/user_schema_validation')
const { product_schema_validator } = require('./server_validation/product_schema_validation')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const { Server } = require('socket.io')
const io = new Server(server)
const jwt = require('jsonwebtoken')
// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);
const { Resend } = require('resend');
const { SocketAddress } = require('net');
const resend = new Resend(process.env.RESEND_API_KEY)
mongoose.connect('mongodb://127.0.0.1:27017/ecommers_db').then(() => console.log('connected to db'))
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
        // console.log(userID)
    })

    socket.on("register_admin", (adminId) => {
        adminSocketId = socket.id;
        console.log("✅ Admin connected:", adminSocketId);
    });

    socket.on('message_for_admin', async ({ to, message }) => {
        if (to == 'Admin') {
            // console.log(users[socket.id]._id)
            let userChat = await Chat.findOne({ 'userid': users[socket.id]._id })
            .populate('userid')
            // console.log(userChat)
            message_object = {
                sender: 'user',
                message: message,
                status: 'unread'
            }
            // console.log(message_object)
            console.log(userChat,' userchat')
            if (!userChat) {
                userChat = new Chat({ userid: users[socket.id]})
            }
            if (adminSocketId) {
                message_object['status'] = 'read'
            }
            userChat.last_message = message
            userChat.updated_at = Date.now()
            userChat.messages.push(message_object)

            io.to(adminSocketId).emit("user_message", { from: socket.id, userChat: userChat });
            await userChat.save()
        }
    })
    socket.on("admin_reply", ({ toUserId, message }) => {
        const clientSocketId = users[toUserId];
        if (clientSocketId) {
            io.to(clientSocketId).emit("private_message", { from: "admin", message });
        }
    });

});

app.set('view engine', 'ejs');
app.engine('ejs', engine)
app.set('views', path.join(__dirname, 'views'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(flash())
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
async function ConvertTokenToUser(req, res, next) {
    let token = req.cookies?.token || null
    console.log(token)
    // console.log('in the middleware ', token)
    if (token == null) {
        res.locals.user = null;
        return next()
    }
    const current_user = await jwt.verify(token, secret_key)
    req.user = current_user
    res.locals.user = req.user;
    // console.log(req.user)
    next()
}

const secret_key = 'Helloworldisthebestjokeforever123'
async function User_To_Token(user) {
    console.log(user)
    const token = await jwt.sign({
        _id: user._id,
        username: user.username,
        Role: user.Role
    }, secret_key)
    console.log(token)
    return token;
}

function CheckAdminLogin(req, res, next) {
    let redirect_url = '/admin/login'
    return IsLogin(req, res, next, redirect_url)
}

function CheckUserLogin(req, res, next) {
    let redirect_url = '/user/login'
    return IsLogin(req, res, next, redirect_url)
}

function IsLogin(req, res, next, redirect_url) {
    console.log(req.user)
    if (req.user) {
        return next()
    }
    return res.redirect(redirect_url)
}


async function IsAdmin(req, res, next) {
    if (req.user.Role == 'Admin') {
        next()
    }
    let redirect_url = req.get('Referrer').split('800')[0]
    return res.redirect('/admin/login')
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
    req.body.Role = 'User'
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

app.get('/user/login', (req, res) => {
    res.render('BackendPages/login.ejs', { purpose: 'User' })
})

app.post('/user/login', authenticate_user, async (req, res) => {
    const token = await User_To_Token(req.user)
    res.cookie('token', token)
    res.redirect('/')
})

app.get('/user/register', (req, res) => {
    res.render('BackendPages/register.ejs')
})
app.post('/user/register', Validate_user, async (req, res) => {
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
    res.redirect('/user/login')
})

app.get('/user/logout', (req, res) => {
    if (req.user) {
        res.clearCookie("token");
    }
    return res.redirect('/')

})
app.get('/user/:id', (req, res) => {
    res.render('pages/user_profile.ejs')
})
app.get('/product/:category_name/user_view', async (req, res) => {
    let product_name = req.params.category_name
    product_name = product_name.charAt(0).toUpperCase() + product_name.slice(1);
    const AllProducts = await Product.find({ category: product_name })
    const categories = await Product.distinct('subCategory', { category: product_name })
    return res.render('pages/Product.ejs', { category: product_name, AllProducts: AllProducts, categories: categories })
})


app.post('/create-checkout-session', IsLogin, async (req, res) => {
    let items = JSON.parse(req.body.items)
    console.log('after Parsed', items)
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

    console.log(itemsData)
    const session = await stripe.checkout.sessions.create({
        line_items: itemsData,
        mode: 'payment',
        success_url: `http://localhost:800/success`,
        cancel_url: `http://localhost:800/cancel`,
    });
    console.log(session)
    res.redirect(303, session.url);
});

app.post('/order', IsLogin, (req, res) => {
    console.log(req.body)
    console.log(req.user)
    res.send('order created')
    // created_by,status,items,total
})
app.get('/success', async (req, res) => {
    console.log('success', req)
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

app.get('/admin/login', (req, res) => {
    req.session.previous_url = req.url
    res.render('BackendPages/login.ejs', { purpose: 'Admin' })
})

app.post('/admin/login', authenticate_user, async (req, res) => {
    const token = await User_To_Token(req.user)
    console.log(token)
    res.cookie('token', token)
    res.redirect('/dashboard')
})


app.get('/dashboard', (req, res) => {
    res.render('BackendPages/dashboard.ejs')
})

app.get('/product', async (req, res) => {
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

app.get('/add_product', (req, res) => {
    res.render('BackendPages/add_product.ejs')
})

function Validate_Product(req, res, next) {
    req.body.available_sizes = req.body.available_sizes.split(',')
    console.log(req.body)
    const check = product_schema_validator.validate(req.body)
    console.log(check)
    if (check.error) {
        throw new MyError(400, check.error.details[0].message)
    }
    next()

}
app.post('/add_product', Validate_Product, async (req, res) => {
    const product = await Product.create(req.body)
    req.flash('success', 'Product Added SuccessFully')
    res.redirect('/add_product')
})
app.get('/product/:id', (req, res) => {

})
app.put('/product/:id', (req, res) => {

})




app.get('/order/manage', (req, res) => {
    res.render('BackendPages/orderpage.ejs')

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
app.get('/messages', async (req, res) => {
    const chats = await Chat.find({}).populate('userid')

    console.log(chats)
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