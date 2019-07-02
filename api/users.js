
'use strict'

const service = require('../services/users')
const mapper = require('../mappers/user')

const api = require('./api-base')('users', 'user')
api.subscribe = async (req) => {
    let entity = await service.update('me', {
        notifications: {
            subscriptions: [{
                key: req.params.key,
                value: true
            }]
        }
    }, req.context)
    return mapper.toModel(entity, req.context)
}

api.unsubscribe = async (req) => {
    let entity = await service.update('me', {
        notifications: {
            subscriptions: [{
                key: req.params.key,
                value: true
            }]
        }
    }, req.context)
    return mapper.toModel(entity, req.context)

}

api.mute = async (req) => {
    let entity = await service.update('me', {
        notifications: {
            enabled: false
        }
    }, req.context)
    return mapper.toModel(entity, req.context)
}

api.unmute = async (req) => {
    let entity = await service.update('me', {
        notifications: {
            enabled: true
        }
    }, req.context)

    return mapper.toModel(entity, req.context)
}

module.exports = api
