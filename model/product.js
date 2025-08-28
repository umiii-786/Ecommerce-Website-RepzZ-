const mongoose = require('mongoose')

const product_schema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Shoes', 'Clothing', 'Accessories']
    },
    subCategory: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    available_stocks: {
        type: Number,
        required: true
    },
    available_sizes: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return v.length >= 0 && v.length <= 7;
            },
            message: 'product having atleast one size'
        }
    },
    img_url: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                // A common regex for URL validation (can be adjusted for specific needs)
                return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v);
            },
            message: props => `${props.value} is not a valid URL!`
        }
    },
    listed_at:{
        type:Date,
        default:Date.now()
    }
})

const Product = mongoose.model('product',product_schema)
module.exports = {
    Product
}