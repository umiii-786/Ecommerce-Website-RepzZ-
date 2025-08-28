const Joi = require('joi')

const product_schema_validator = Joi.object({
    category: Joi.string().required().valid('Shoes', 'Clothing', 'Accessories'),
    subCategory: Joi.string().required(),
    title: Joi.string().required(),
    price: Joi.number().required().min(1),
    available_stocks: Joi.number().required().min(1),
    available_sizes: Joi.array().items(Joi.string().valid('Small', 'Medium', 'Xl', '2Xl')).min(0),
    img_url: Joi.string().required()
})

module.exports = {
    product_schema_validator
}
