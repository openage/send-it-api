
let messageMapper = require('./message')
let userMapper = require('./user')

exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        pic: {},
        type: entity.type,
        entity: {},
        isPublic: entity.isPublic,
        category: entity.category,

        status: entity.status,
        timeStamp: entity.timeStamp
    }

    if (entity.entity) {
        model.entity = {
            id: entity.entity.id,
            type: entity.entity.type,
            name: entity.entity.name
        }
    }

    model.participants = entity.participants.map(p => userMapper.toSummary(p))

    if (entity.pic) {
        model.pic = {
            url: entity.pic.url,
            thumbnail: entity.pic.thumbnail
        }
    }

    if (!model.name) {
        if (entity.type === 'direct') {
            let participant = model.participants.find(i => i.id !== context.user.id)
            if (participant) {
                model.name = ` ${participant.profile.firstName} ${participant.profile.lastName || ''}`.trim()
                model.pic = participant.profile.pic
                model.description = participant.code
            }
        } else {
            if (entity.type === 'entity') {
                model.name = model.entity.name || model.entity.type
            }
        }
    }

    if (entity.lastMessage) {
        model.lastMessage = messageMapper.toSummary(entity.lastMessage)
    }

    if (entity.organization) {
        model.organization = entity.organization._doc ? {
            id: entity.organization.id,
            code: entity.organization.code,
            name: entity.organization.name
        } : {
                id: entity.organization.toString()
            }
    }

    // if (entity.tenant) {
    //     model.tenant = {
    //         id: entity.tenant.id,
    //         code: entity.tenant.code,
    //         name: entity.tenant.name
    //     }
    // }

    return model
}
