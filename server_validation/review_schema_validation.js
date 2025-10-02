const joi=require('joi')
joi.objectId = require('joi-objectid')(joi)
const review_schema_validation=joi.object({
    productId:joi.objectId().required(),
    createdby:joi.objectId().required(),
    rating:joi.number().min(1).max(5).required(),
    description:joi.string().required(),

})


module.exports={
    review_schema_validation
}