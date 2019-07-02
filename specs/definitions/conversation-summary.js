const message = require('./message-summary')

module.exports = {
    id: String,
    name: String,
    pic: {
        url: String,
        thumbnail: String
    },
    category: String,
    lastMessage: message
}
