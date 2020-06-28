'use strict'

const userMapper = require('./user')
const organizationMapper = require('./organization')
exports.toModel = (entity, context) => {
    if (!entity) {
        return
    }
    if (!entity._doc) {
        return {
            id: entity.toString()
        }
    }

    var model = {
        id: entity.id,
        subject: entity.subject,
        body: entity.body,
        date: entity.date,
        priority: entity.priority,
        category: entity.category,
        attachments: (entity.attachments || []).map(a => {
            return {
                filename: a.filename,
                mimeType: a.mimeType,
                thumbnail: a.thumbnail,
                description: a.description,
                url: a.url
            }
        }),
        meta: entity.meta,
        status: entity.status,
        timeStamp: entity.timeStamp
    }

    if (entity.from) {
        model.from = userMapper.toModel(entity.from)
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

    if (entity.meta.to) {
        entity.meta.to.forEach(t => {
            model.to.push({
                user: t.user,
                deliveredOn: t.deliveredOn,
                viewedOn: t.viewedOn,
                processedOn: t.processedOn,
                archivedOn: t.archivedOn
            })
        });
    }

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
    if (!entity) {
        return
    }
    if (!entity._doc) {
        return {
            id: entity.toString()
        }
    }
    var model = {
        id: entity.id,
        body: entity.body,
        subject: entity.subject,
        date: entity.date,
        status: entity.status,
        modes: entity.modes,
        attachments: (entity.attachments || []).map(a => {
            return {
                filename: a.filename,
                mimeType: a.mimeType,
                thumbnail: a.thumbnail,
                description: a.description,
                url: a.url
            }
        }),
    }

    if (entity.from) {
        model.from = userMapper.toSummary(entity.from)
    }

    if (entity.organization) {
        model.organization = organizationMapper.toModel(entity.organization)
    }

    if (entity.conversation) {
        model.conversation = entity.conversation._doc ? {
            id: entity.conversation.id
        } : {
                id: entity.conversation.toString()
            }
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

    return model
}

exports.toSearchModel = (entities, context) => {
    return entities.map(entity => {
        return exports.toModel(entity, context)
    })
}
