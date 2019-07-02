'use strict'
exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        config: entity.config,
        status: entity.status,
        category: entity.category,
        timeStamp: entity.timeStamp
    }

    if (entity.provider) {
        model.provider = {
            id: entity.provider.id,
            code: entity.provider.code,
            name: entity.provider.name,
            category: entity.provider.category,
            parameters: entity.provider.parameters
        }
    }

    if (entity.organization) {
        model.organization = {
            id: entity.organization.id,
            code: entity.organization.code,
            name: entity.organization.name
        }
    }

    if (entity.tenant) {
        model.tenant = {
            id: entity.tenant.id,
            code: entity.tenant.code,
            name: entity.tenant.name
        }
    }

    return model
}
