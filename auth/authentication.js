
const jwt = require('jsonwebtoken')


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

module.exports={
    ConvertTokenToUser,
    User_To_Token
}