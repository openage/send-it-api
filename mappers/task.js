'use strict'

exports.toModel = (entity, context) => {
    const model = {
        id: entity.id,
        entity: entity.entity,
        date: entity.date,
        progress: entity.progress,
        data: entity.data,
        error: entity.error,
        status: entity.status
    }

    return model
}

exports.toSearchModel = (entities, context) => {
    return entities.map((entity) => {
        return exports.toModel(entity, context)
    })
}
