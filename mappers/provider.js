'use strict'

exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        url: entity.url,
        description: entity.description,
        category: entity.category,
        discoverable: entity.discoverable,
        picUrl: entity.picUrl,
        timeStamp: entity.timeStamp
    }
    model.parameters = []
    for (let index = 0; index < entity.parameters.length; index++) {
        let parameter = entity.parameters[index]
        model.parameters.push({
            name: parameter.name,
            title: parameter.title,
            type: parameter.type,
            description: parameter.description,
            validators: parameter.validators || [],
            options: parameter.options || []
        })
    }
    return model
}
