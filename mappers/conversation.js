
let messageMapper = require('./message')
let userMapper = require('./user')

exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        name: entity.name,
        description: entity.description,
        type: entity.type,
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

    if (entity.lastMessage) {
        model.lastMessage = messageMapper.toSummary(entity.lastMessage)
    }

    model.participants = entity.participants.map(p => userMapper.toSummary(p))

    if (entity.organization) {
        model.organization = {
            id: entity.organization.id,
            code: entity.organization.code,
            name: entity.organization.name
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
