'use strict'
var _ = require('underscore')

exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        subject: entity.subject,
        body: entity.body,
        config: entity.config,

        thumbnail: entity.thumbnail,

        status: entity.status,
        timeStamp: entity.timeStamp
    }

    if (entity.attachment) {
        model.attachment = {
            id: entity.attachment.id,
            code: entity.attachment.code,
            name: entity.attachment.name,
        }
    }

    if (entity.dataSource) {
        model.dataSource = {
            type: entity.dataSource.type,
            connectionString: entity.dataSource.connectionString,
            meta: entity.dataSource.meta,
            params: [],
            field: entity.dataSource.field
        }

        if (entity.dataSource.params && entity.dataSource.params.length) {
            for (const param of entity.dataSource.params) {
                model.dataSource.params.push({
                    key: param.key,
                    value: params.value
                })
            }
        }
    }

    if (entity.organization) {
        model.level = 'organization'
        model.organization = entity.organization._doc ? {
            id: entity.organization.id,
            code: entity.organization.code,
            name: entity.organization.name
        } : { id: entity.organization.toString() }
    } else if (entity.tenant) {
        model.level = 'tenant'
        model.tenant = entity.tenant._doc ? {
            id: entity.tenant.id,
            code: entity.tenant.code,
            name: entity.tenant.name
        } : { id: entity.tenant.toString() }
    } else {
        model.level = 'system'
    }

    return model
}
