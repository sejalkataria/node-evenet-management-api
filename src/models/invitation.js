const mongoose = require('mongoose')

const invitationSchema = new mongoose.Schema({
    invitee: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    eventOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},
    { timestamps: true }
)

const Invitation = mongoose.model('Invitation', invitationSchema, 'Invitation')

module.exports = Invitation