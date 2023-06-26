const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const resetAuth = require('../middleware/resetAuth')

const router = new express.Router()

//register user
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})

//login user
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })

    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})

//forget password
router.put('/users/forget-password', async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findByEmail(req.body.email)
        const resetToken = await user.generatePasswordToken()
        res.status(200).send({ user, resetToken })
    } catch (e) {
        res.status(400).send({ e: e.message })
    }

})

//reset password
router.put('/users/reset-password', resetAuth, async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    const updates = Object.keys(req.body)
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

//logout user
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        req.user.save()
        res.send('logged out successfully!')
    } catch (e) {
        res.status(500).send({ e: e.message })
    }
})

//logout from all device
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        req.user.save()
        res.send('logged out from all devices!')
    } catch (e) {
        res.status(500).send({ e: e.message })
    }
})

module.exports = router