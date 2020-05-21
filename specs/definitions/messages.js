const user = require('./user-summary')
const conversation = require('./conversation-summary')

module.exports = {
    id: String,
    subject: String,
    body: String,
    date: Date,
    conversation: conversation,
    from: user,
    to: [{
        user: user,
        deliveredOn: Date,
        viewedOn: Date,
        processedOn: Date,
        archivedOn: Date
    }],
    priority: String,
    attachments: [{
        mimeType: String,
        thumbnail: String,
        url: String
    }],
    data: Object,
    meta: Object,
    isHidden: Boolean,
    status: String
}
