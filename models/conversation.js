var mongoose = require('mongoose')

module.exports = {
    name: String,
    pic: {
        url: String,
        thumbnail: String
    },
    description: String,
    type: {
        type: String,
        enum: ['group', 'entity', 'direct']
    },
    isPublic: Boolean,
    category: String,
    entity: {
        id: String,
        name: String,
        type: { type: String }
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'message'
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant'
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'in-active', 'archived']
    }
}
