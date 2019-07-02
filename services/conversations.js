const db = require('../models')

const userService = require('./users')

const set = async (model, entity, context) => {
    if (model.name) {
        entity.name = model.name
    }

    if (model.description) {
        entity.description = model.description
    }

    if (model.pic) {
        entity.pic = {
            url: model.pic.url,
            thumbnail: model.pic.thumbnail
        }
    }

    if (model.isPublic !== undefined) {
        entity.isPublic = model.isPublic
    }

    if (model.category) {
        entity.category = model.category
    }

    if (model.status) {
        entity.status = model.status
    }
}
exports.search = async (query, page, context) => {
    let where = {
        participants: context.user,
        tenant: context.tenant
    }

    if (!page || !page.limit) {
        return {
            items: await db.conversation.find(where).sort({ timestamp: 1 }).populate('participants owner lastMessage')
        }
    }

    return {
        items: await db.conversation.find(where).sort({ timestamp: 1 }).limit(page.limit).skip(page.skip).populate('participants owner lastMessage'),
        count: await db.conversation.count(where)
    }
}

exports.update = async (id, model, context) => {
    let entity = await db.conversation.findById(id).populate('participants owner lastMessage')
    await set(model, entity, context)
    return await entity.save()
}

exports.get = async (query, context) => {
    if (!query) {
        return null
    }
    if (typeof query === 'string' && query.isObjectId()) {
        return db.conversation.findById(query).populate('participants owner lastMessage')
    }

    if (query._doc) {
        return query
    }

    if (query.id) {
        return db.conversation.findById(query.id).populate('participants owner lastMessage')
    }

    if (query.entity) {
        return exports.getEntityConversation(query.entity, context)
    }

    if (query.users && query.users.length) {
        return exports.getDirectConversation(query.users, context)
    }

    return null
}

exports.addParticipant = async (conversation, user, context) => {
    const entity = exports.get(conversation, context)

    if (!entity) {
        throw new Error('CONVERSATION_IS_INVALID')
    }

    user = await userService.get(user)

    if (entity.participants.find(p => p.id === user.id)) {
        throw new Error('CONVERSATION_ALREADY_JOINED')
    }

    entity.participants.push(user)
    return entity.save()
}

exports.removeParticipant = async (conversation, user, context) => {
    const entity = exports.get(conversation, context)

    if (!entity) {
        throw new Error('CONVERSATION_IS_INVALID')
    }

    user = await userService.get(user)

    if (!entity.participants.find(p => p.id === user.id)) {
        throw new Error('CONVERSATION_ALREADY_REMOVED')
    }

    entity.participants = entity.participants.filter(p => p.id !== user.id)
    return entity.save()
}

exports.getEntityConversation = async (entity, context) => {
    let conversation = await db.conversation.findOne({
        type: 'entity',
        'entity.id': entity.id.toLowerCase(),
        'entity.type': entity.type.toLowerCase()
    }).populate('participants owner lastMessage')

    if (!conversation) {
        conversation = new db.conversation({
            name: entity.name || entity.type,
            entity: {
                id: entity.id.toLowerCase(),
                type: entity.type.toLowerCase(),
                name: entity.name
            },
            type: 'entity',
            tenant: context.tenant
        })

        await conversation.save()
    }

    return conversation
}

exports.getDirectConversation = async (users, context) => {
    if (!Array.isArray(users)) {
        users = [users]
    }
    users.push(context.user)

    let userIds = users.map(i => i.id)
    let conversation = await db.conversation.findOne({
        type: 'direct',
        'participants': {
            '$size': userIds.length, '$all': userIds
        }
    }).populate('participants owner lastMessage')

    if (!conversation) {
        conversation = new db.conversation({
            name: entity.name || entity.type,
            entity: {
                id: entity.id.toLowerCase(),
                type: entity.type.toLowerCase()
            },
            type: 'entity',
            tenant: context.tenant
        })

        await conversation.save()
    }

    return conversation
}

exports.createGroupConversation = async (name, users, context) => {
    if (!Array.isArray(users)) {
        users = [users]
    }
    users.push(context.user)

    let conversation = new db.conversation({
        name: name,
        type: 'group',
        participants: users,
        owner: context.user,
        tenant: context.tenant
    })

    await conversation.save()
    return conversation
}
