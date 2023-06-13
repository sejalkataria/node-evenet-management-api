const jwt = require('jsonwebtoken')

const User = require('../models/user')

const resetAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.REST_PASSWORD_SECRET)
        const user = await User.findOne({ _id: decode._id, 'resetLinkToken.token': token })
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.resetLinkToken = token
        next()
    }
    catch (e) {
        res.status(401).send({ error: 'session expired' })
    }

}

module.exports = resetAuth