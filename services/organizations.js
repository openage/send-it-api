'use strict'
const db = require('../models')

const set = async (model, entity, context) => {
    if (model.name) {
        entity.name = model.name
    }
    if (model.config) {
        entity.config = model.config
    }
    if (model.status) {
        entity.status = model.status
    }

    if (!model.notifications) {
        return
    }

    entity.notifications = entity.notifications || {
        enabled: true,
        subscriptions: {}
    }

    if (model.notifications.enabled !== undefined) {
        entity.notifications.enabled = model.notifications.enabled
    }

    if (model.notifications.subscriptions) {
        let keys = Object.keys(model.notifications.subscriptions)
        for (let index = 0; index < keys.length; index++) {
            entity.notifications.subscriptions[keys[index]] = model.notifications.subscriptions[keys[index]]
        }
    }
}

exports.update = async (id, model, context) => {
    if (id === 'me') {
        id = context.organization.id
    }

    let organization = await db.organization.findById(id).populate('owner')
    await set(model, organization, context)
    return organization.save()
}

exports.get = async (query, context) => {
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.organization.findById(query).populate('owner')
        } else {
            if (query === 'me') {
                return db.organization.findById(context.organization.id).populate('owner')
            }
            return db.organization.findOne({ code: query.toLowerCase(), tenant: context.tenant }).populate('owner')
        }
    }

    if (query.id) {
        if (query.id === 'me') {
            return db.organization.findById(context.organization.id).populate('owner')
        }
        return db.organization.findById(query.id).populate('owner')
    }

    if (query.code) {
        return db.organization.findOne({ code: query.code.toLowerCase(), tenant: context.tenant }).populate('owner')
    }

    return null
}

exports.getOrCreate = async (model, context) => {
    let log = context.logger.start('services/clients:getOrCreate')

    let organization = await exports.get(model, context)

    if (!organization) {
        organization = await new db.organization({
            code: model.code.toLowerCase(),
            name: model.name,
            shortName: model.shortName,
            address: model.address,
            contacts: model.contacts,
            tenant: context.tenant,
            status: 'active'
        }).save()
    }

    log.end()
    return organization
}

exports.getByCode = async (code, context) => {
    return db.organization.findOne({
        code: code.toLowerCase(),
        tenant: context.tenant
    })
}

exports.search = async (query, page, context) => {
    let where = {
        tenant: context.tenant
    }
    if (!page || !page.limit) {
        return {
            items: await db.organization.find(where)
        }
    }
    return {
        items: await db.organization.find(where).limit(page.limit).skip(page.skip),
        count: await db.organization.count(where)
    }
}
