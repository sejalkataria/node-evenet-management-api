const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Event = require('./event')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                return 'Please enter valid email!'
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length < 6) {
                return 'Password must be greater than 6'
            }
            else if (value.toLowerCase() === 'password') {
                return 'Password must not be "password"'
            }
        }
    },
    tokens: [{
        token: {
            type: String
        }
    }],
    resetLinkToken: [{
        token: {
            type: String
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

userSchema.virtual("events", {
    type: 'Event',
    localField: '_id',
    foreignField: 'owner'
})

// userSchema.virtual("invitations",{
//     type:'Invitation',
//     localField:'_id',
//     foreignField:'eventOwner'
// })

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.generatePasswordToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.REST_PASSWORD_SECRET, { expiresIn: '15m' })
    user.resetLinkToken = user.resetLinkToken.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByEmail = async function (email) {
    const user = await User.findOne({ email })
    if (!user) {
        return 'email not found'
    }
    return user
}

userSchema.statics.findByCredentials = async function (email, password) {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('email not found')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Password doesnot match!')
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema, 'User')
module.exports = User