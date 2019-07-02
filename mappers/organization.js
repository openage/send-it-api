'use strict'

exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        config: entity.config,
        status: entity.status,
        timeStamp: entity.timeStamp
    }

    if (entity.tenant) {
        model.tenant = entity.tenant._doc ? {
            id: entity.tenant.id,
            code: entity.tenant.code,
            name: entity.tenant.name
        } : {
                id: entity.tenant.toString()
            }
    }

    if (entity.owner) {
        model.owner = entity.owner._doc ? {
            id: entity.owner.id,
            name: entity.owner.name,
            email: entity.owner.email
        } : {
                id: entity.owner.toString()
            }
    }

    return model
}
