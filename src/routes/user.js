const express = require('express')
const User = require('../models/user')
const restAuth = require('../middleware/resetAuth')
const resetAuth = require('../middleware/resetAuth')

const router = new express.Router()

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

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })

    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})

router.put('/users/forget-password', async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findByEmail(req.body.email)
        const resetToken = await user.generatePasswordToken()
        // const data={
        //     from:'noreply@hello.com',
        //     to:email,
        //     subject:'password reset link',
        //     html:`
        //     <h2>Please click on given link to reset your password </h2>
        //     <p>${process.env.CLIENTURL}/resetpassword/${token}</p>
        //     `
        // }
        res.status(200).send({ user, resetToken })
    } catch (e) {
        res.status(400).send({ e: e.message })
    }

})

router.put('/users/reset-password', resetAuth, async (req, res) => {
    const user = await User.findOne({ _id: req.user._id })
    console.log("user.....", user)
    console.log("body.....", req.body)
    const updates = Object.keys(req.body)
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        console.log('updated')
        res.send(req.user)
    }
    catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router