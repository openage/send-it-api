'use strict'

exports.toModel = (entity, context) => {
    var model = {
        id: entity.id,
        code: entity.code,
        email: entity.email,
        phone: entity.phone,
        status: entity.status,
        devices: (entity.devices || []).map(d => {
            return {
                id: d.id,
                name: d.name,
                status: d.status
            }
        }),
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
                thumbnail: entity.profile.pic.thumbnail
            }
        }
    }

    if (entity.role) {
        model.role = {
            id: entity.role.id,
            code: entity.role.code
        }
    }

    if (entity.organization && entity.organization._doc) {
        var orgLogo = entity.organization.logo || {}
        model.organization = {
            id: entity.organization.id,
            code: entity.organization.code,
            name: entity.organization.name,
            logo: {
                url: orgLogo.url,
                thumbnail: orgLogo.thumbnail
            }
        }
    }

    return model
}

exports.toSummary = (entity) => {
    if (!entity._doc) {
        return {
            id: entity.toString()
        }
    }
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
                thumbnail: entity.profile.pic.thumbnail
            }
        }
    }

    if (entity.role) {
        model.role = {
            id: entity.role.id,
            code: entity.role.code
        }
    }

    return model
}
