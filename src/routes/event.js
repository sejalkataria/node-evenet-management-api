const express = require('express')
const auth = require('../middleware/auth')
const Event = require('../models/event')
const User = require('../models/user')
const Invitation = require('../models/invitation')

const router = new express.Router()

//to create event of loggedIn User
router.post('/events', auth, async (req, res) => {
    console.log('event body', { ...req.body })
    const event = new Event({
        ...req.body,
        owner: req.user._id
    })
    try {
        await event.save()
        res.status(201).send(event)
    }
    catch (e) {
        res.status(400).send({ e: e.message })
    }
})

//to get all events of loggedIn User
router.get('/events', auth, async (req, res) => {
    const user = req.user._id
    const sort = {}
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":")
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        const event = await Event.find({ owner: user })
            .limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort(sort)
        res.status(200).send(event)
    }
    catch (e) {
        res.status(400).send({ e: e.message })
    }
})

//to get event by id
router.get('/events/:id', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
        res.status(200).send(event)
    } catch (e) {
        res.status(400).send({ e: e.message })
    }
})

//to send invitation
router.post('/events/invitation', auth, async (req, res) => {
    try {
        const findEvent = await Event.findById(req.body.event)
        const findInviteeUser = await User.findById(req.body.invitee)
        if (!findEvent || !findInviteeUser) {
            throw new Error('event/user not found')
        }
        const invitation = new Invitation({
            invitee: findInviteeUser.name,
            event: findEvent.eventName,
            eventOwner: req.user._id
        })
        await invitation.save()
        res.send(invitation)
    }
    catch (e) {
        res.status(402).send({ e: e.message })
    }
})

//get all invitations sent by logged In User
router.get('/invitations', auth, async (req, res) => {
    const owner = req.user._id
    try {
        const invitations = await Invitation.find({ eventOwner: owner })
        res.send(invitations)
    }
    catch (e) {
        res.send({ e: e.message })
    }


})

//get all invitations sent to the logged in User
router.get('/party', auth, async (req, res) => {
    const owner = req.user.name
    try {
        const invitations = await Invitation.find({ invitee: owner })
        res.send(invitations)
    } catch (e) {
        res.send({ e: e.message })
    }
})

module.exports = router