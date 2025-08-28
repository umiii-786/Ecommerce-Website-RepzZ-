const joi=require('joi')

const message_schema_validator=joi.object({
      message:joi.string().required()
})

module.exports={
    message_schema_validator
}


