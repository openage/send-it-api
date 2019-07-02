'use strict'
var _ = require('underscore')

var templateMapper = require('./template')

exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        code: entity.code,
        name: entity.name,
        processor: entity.processor,
        data: entity.data,
        config: entity.config,
        lastRun: {},
        schedule: {},

        status: entity.status,
        timeStamp: entity.timeStamp
    }

    if (entity.lastRun) {
        model.lastRun.status = entity.lastRun.status
        model.lastRun.error = entity.lastRun.error
        model.lastRun.date = entity.lastRun.date
        model.lastRun.lastSuccess = entity.lastRun.lastSuccess
    }

    if (entity.schedule) {
        model.schedule.hour = entity.schedule.hour
        model.schedule.minute = entity.schedule.minute
    }

    if (entity.template) {
        model.template = {
            id: entity.template.id,
            code: entity.template.code,
            name: entity.template.name,
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
