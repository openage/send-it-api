'use strict'

const userMapper = require('./user')
const organizationMapper = require('./organization')
exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        subject: entity.subject,
        body: entity.body,
        date: entity.date,
        priority: entity.priority,
        category: entity.category,
        attachments: entity.attachments,
        meta: entity.meta,
        status: entity.status,
        timeStamp: entity.timeStamp
    }

    if (entity.from) {
        model.from = userMapper.toSummary(entity.from)
    }

    model.to = entity.to.map(t => {
        return {
            user: userMapper.toSummary(t.user),
            deliveredOn: t.deliveredOn,
            viewedOn: t.viewedOn,
            processedOn: t.processedOn,
            archivedOn: t.archivedOn
        }
    })

    if (entity.conversation) {
        model.conversation = entity.conversation._doc ? {
            id: entity.conversation.id
        } : {
                id: entity.conversation.toString()
            }
    }

    return model
}

exports.toSummary = (entity) => {
    var model = {
        id: entity.id,
        body: entity.body,
        subject: entity.subject,
        date: entity.date,
        status: entity.status,
        modes: entity.modes
    }

    if (entity.from) {
        model.from = userMapper.toSummary(entity.from)
    }

    if (entity.organization) {
        model.organization = organizationMapper.toModel(entity.organization)
    }

    return model
}

exports.toSearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
}
