//  { id: "ORD001", customer: "Jane Doe", date: "2025-08-15", status: "pending", total: 250.00 },
const mongoose = require('mongoose')

const itemSchema = mongoose.Schema({
    item_name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { _id: false });

const order_schema = new mongoose.Schema({
    created_by: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        required: true
    },
    items: {
        type: [itemSchema],
        required: true,
        min:1
    },
    total: {
        type:Number,
        required:true
    },
    placed_at: {
        type: Date,
        default: Date.now()
    }
})

const Order = mongoose.model('order',order_schema)


module.exports = {
    Order
}