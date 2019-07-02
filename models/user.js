'use strict'
var mongoose = require('mongoose')
module.exports = {
    role: {
        id: String,
        key: String,
        code: String,
        permissions: [{
            type: String
        }],
        user: {
            id: String
        },
        organization: {
            id: String,
            code: String,
            name: String
        }
    },
    email: String,
    phone: String,
    code: String,
    token: String, // TODO: obsolete
    otp: String, // TODO: obsolete
    profile: {
        firstName: String,
        lastName: String,
        gender: String,
        dob: Date,
        pic: {
            url: String,
            thumbnail: String
        }
    },
    address: {
        line1: String,
        line2: String,
        district: String,
        city: String,
        state: String,
        pinCode: String,
        country: String
    },
    status: String,
    chat: {
        id: Number,
        key: String,
        statusMessage: String
    },
    devices: [{
        id: String,
        name: String,
        status: {
            type: String,
            default: 'active',
            enum: ['active', 'inactive']
        }
    }],
    notifications: {
        enabled: { type: Boolean, default: true },
        snooze: Date,
        refusals: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'template'
        }]
    },

    lastSeen: Date,
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organization'
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tenant'
    }
}
