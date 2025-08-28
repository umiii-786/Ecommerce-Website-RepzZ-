const joi=require('joi')

const order_item_schema=joi.object({
      item_name:joi.string().required(),
      price:joi.number().required()
})

const order_schema_validator=joi.object({
    status:joi.string().required().allow(['Pending', 'Shipped', 'Delivered', 'Cancelled']),
    items:joi.array().length().min(1).items(order_item_schema),
    total:joi.number().required()
})

module.exports={
    order_schema_validator
}

