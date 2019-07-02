'use strict'
var _ = require('underscore')

exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        code: entity.code,
        email: entity.email,
        phone: entity.phone,
        status: entity.status,
        devices: entity.devices,
        notifications: entity.notifications,
        timeStamp: entity.timeStamp
    }

    if (entity.profile) {
        model.profile = {
            firstName: entity.profile.firstName,
            lastName: entity.profile.lastName
        }

        if (entity.profile.pic) {
            model.profile.pic = {
                url: entity.profile.pic.url,
                data: entity.profile.pic.data
            }
        }
    }

    if (entity.roles) {
        model.roles = []

        entity.roles.forEach(item => {
            let role = {
                level: item.level,
                token: item.token,
                permissions: item.permissions
            }
            if (item.entity) {
                role.entity = {}
                if (item.entity.code) {
                    role.entity.id = item.entity.id
                    role.entity.code = item.entity.code
                    role.entity.name = item.entity.name
                } else {
                    role.entity.id = item.entity
                }
            }
            model.roles.push(role)
        })
    }

    if (entity.organization) {
        model.organization = {
            id: entity.organization.toString()
        }
    }

    if (entity.tenant) {
        model.tenant = {
            id: entity.tenant.toString()
        }
    }

    return model
}

exports.toSummary = (entity) => {
    const model = {
        id: entity.id,
        code: entity.code,
        lastSeen: entity.lastSeen
    }

    if (entity.profile) {
        model.profile = {
            firstName: entity.profile.firstName,
            lastName: entity.profile.lastName
        }

        if (entity.profile.pic) {
            model.profile.pic = {
                url: entity.profile.pic.url,
                data: entity.profile.pic.data
            }
        }
    }

    return model
}
