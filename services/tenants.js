'use strict'
var db = require('../models')

const set = async (model, entity, context) => {
    if (model.name) {
        entity.name = model.name
    }
    if (model.status) {
        entity.status = model.status
    }

    if (model.config) {
        entity.config = model.config
    }

    if (model.owner) {
        let user = await db.user.findOrCreate({
            email: model.owner.email
        }, {
            email: model.owner.email,
            name: model.owner.name,
            tenant: tenant
        })

        tenant.owner = user.result
    }
}

exports.update = async (id, model, context) => {
    if (id === 'me') {
        id = context.tenant.id
    }
    let tenant = await db.tenant.findById(id).populate('owner')
    await set(model, tenant, context)
    return await tenant.save()
}

exports.get = async (query, context) => {
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.tenant.findById(query).populate('owner')
        } else {
            if (query === 'me') {
                return db.tenant.findById(context.tenant.id).populate('owner')
            }
            return db.tenant.findOne({ code: query.toLowerCase() }).populate('owner')
        }
    }

    if (query.id) {
        if (query.id === 'me') {
            return db.tenant.findById(context.tenant.id).populate('owner')
        }
        return db.tenant.findById(query.id).populate('owner')
    }

    if (query.code) {
        return db.tenant.findOne({ code: query.code.toLowerCase() }).populate('owner')
    }

    return null
}

exports.getOrCreate = async (model, context) => {
    let log = context.logger.start('services/tenants:clone')

    let tenant = await exports.get(model, context)

    if (!tenant) {
        tenant = new db.tenant({
            name: model.name,
            code: model.code.toLowerCase(),
            status: 'active'
        }).save()
    }

    log.end()
    return tenant
}

exports.search = async (query, page, context) => {
    let where = {
    }
    if (!page || !page.limit) {
        return {
            items: await db.tenant.find(where)
        }
    }
    return {
        items: await db.tenant.find(where).limit(page.limit).skip(page.skip),
        count: await db.tenant.count(where)
    }
}
