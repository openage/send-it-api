'use strict'

const entities = require('../models').template
const db = require('../models')

const getByCode = async (code, context) => {
    let template = null
    if (context.organization) {
        template = await entities.findOne({
            organization: context.organization,
            code: code,
            status: 'active'
        })
    }

    if (!template) {
        template = await entities.findOne({
            tenant: context.tenant,
            organization: { $exists: false },
            code: code,
            status: 'active'
        })
    }

    if (!template) {
        throw new Error('TEMPLATE_IS_INVALID')
    }

    return template
}

const set = async (model, entity, context) => {
    if (model.name) {
        entity.name = model.name
    }
    if (model.status) {
        entity.status = model.status
    }

    if (model.subject) {
        entity.subject = model.subject
    }

    if (model.body) {
        entity.body = model.body
    }

    if (model.config) {

        if (model.config.page) {
            entity.config.page = model.config.page
        }

        if (model.config.to) {
            entity.config.to = model.config.to
        }

        if (model.config.modes) {
            entity.config.modes = model.config.modes
        }

        if (model.config.entity) {
            entity.config.entity = model.config.entity
        }
    }

    if (model.logo) {
        entity.logo = model.logo
    }

    if (model.dp) {
        entity.dp = model.dp
    }

    if (model.isHidden !== undefined) {
        entity.isHidden = model.isHidden
    }

    if (model.actions) {
        entity.category = model.category
    }

    if (model.attachment && model.attachment.code) {
        entity.attachment = await getByCode(attachment.code, context)
    }

    if (model.actions) {
        entity.actions = model.actions
    }

    if (model.dataSource) {
        entity.dataSource = model.dataSource
    }
}

exports.create = async (model, context) => {
    let entity = await getByCode(model.code, context)
    if (!entity) {
        entity = new db.template({
            code: model.code.toLowerCase(),
            organization: context.organization,
            tenant: context.tenant
        })
    }
    await set(model, entity, context)
    return await entity.save()
}

exports.update = async (id, model, context) => {
    let entity = await exports.get(id, context)
    if (!entity) {
        entity = new db.template({
            code: model.code,
            organization: context.organization,
            tenant: context.tenant
        })
    }

    if (context.organization && !entity.organization) {
        throw new Error('TEMPLATE_IS_READONLY')
    }
    await set(model, entity, context)
    return entity.save()
}

exports.get = async (query, context) => {
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.template.findById(query).populate('attachment')
        } else {
            return getByCode(query, context)
        }
    }

    if (query.id) {
        return db.template.findById(query).populate('attachment')
    }

    if (query.code) {
        return getByCode(query.code, context)
    }

    return null
}

exports.search = async (query, page, context) => {
    const where = {
        tenant: context.tenant
    }

    if (query.level !== 'tenant') {
        where.organization = context.organization
    }

    return {
        items: await entities.find(where).populate('attachment tenant organization')
    }
}

exports.getByCode = getByCode
