const mongoose = require('mongoose')

const User = mongoose.model('User', {
    username: String,
    password: String,
    role: String         //user or admin
})

module.exports = User