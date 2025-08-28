const Joi=require('joi')

const user_schema_validator = Joi.object({
    username: Joi.string().required(),
    email:Joi.string().required(),
    password:Joi.string().required(),
})
module.exports={
    user_schema_validator
}
