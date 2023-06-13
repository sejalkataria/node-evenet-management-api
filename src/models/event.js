const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

const Event = mongoose.model('Event', eventSchema, 'Event')
module.exports = Event