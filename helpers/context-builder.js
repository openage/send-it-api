'use strict'
const db = require('../models')
const locks = require('./locks')

const defaultConfig = require('config').get('organization')

const searchInConfig = (identifier, config) => {
    var keys = identifier.split('.')
    var value = config

    for (var key of keys) {
        if (!value[key]) {
            return null
        }
        value = value[key]
    }

    return value
}

exports.create = async (claims, logger) => {
    let context = {
        logger: logger || claims.logger,
        config: defaultConfig,
        permissions: []
    }

    let log = context.logger.start('context-builder:create')

    context.setUser = async (user) => {
        if (!user) {
            return
        }
        if (user._doc) {
            context.user = user
        } else if (user.id) {
            context.user = await db.user.findOne({ _id: user.id }).populate('organization tenant')
        }

        if (user.role && user.role.permissions) {
            context.permissions.push(...user.role.permissions)
        }

        if (context.organization && context.organization.owner && context.organization.owner.id === context.user.id) {
            context.permissions.push(...['organization.owner', 'organization.admin'])
        }

        if (context.tenant && context.tenant.owner && context.tenant.owner.id === context.user.id) {
            context.permissions.push(...['tenant.owner', 'tenant.admin'])
        }

        context.logger.context.user = {
            id: context.user.id,
            code: context.user.code
        }
    }

    context.setOrganization = async (organization) => {
        if (!organization) {
            return
        }
        if (organization._doc) {
            context.organization = organization
        } else if (organization.id) {
            context.organization = await db.organization.findOne({ _id: organization.id }).populate('owner tenant')
        } else if (organization.key) {
            context.organization = await db.organization.findOne({ key: organization.key }).populate('owner tenant')
        } else if (organization.code) {
            context.organization = await db.organization.findOne({
                code: organization.code,
                tenant: context.tenant
            }).populate('owner tenant')
        }

        if (context.organization.config) {
            context.config = context.organization.config
            context.config.timeZone = context.config.timeZone || 'IST'
        }

        context.logger.context.organization = {
            id: context.organization.id,
            code: context.organization.code
        }
    }

    context.setTenant = async (tenant) => {
        if (!tenant) {
            return
        }
        if (tenant._doc) {
            context.tenant = tenant
        } else if (tenant.id) {
            context.tenant = await db.tenant.findOne({ _id: tenant.id }).populate('owner')
        } else if (tenant.key) {
            context.tenant = await db.tenant.findOne({ key: tenant.key }).populate('owner')
        } else if (tenant.code) {
            context.tenant = await db.tenant.findOne({ code: tenant.code }).populate('owner')
        }

        context.logger.context.tenant = {
            id: context.tenant.id,
            code: context.tenant.code
        }
    }

    await context.setTenant(claims.tenant)
    await context.setOrganization(claims.organization)
    await context.setUser(claims.user)

    context.getConfig = (identifier, defaultValue) => {
        var value = searchInConfig(identifier, context.config)
        if (!value) {
            value = searchInConfig(identifier, defaultConfig)
        }
        if (!value) {
            value = defaultValue
        }
        return value
    }

    context.hasPermission = (request) => {
        if (!request) {
            return true
        }

        let items = Array.isArray(request) ? request : [request]

        return context.permissions.find(permission => {
            return items.find(item => item.toLowerCase() === permission)
        })
    }

    context.lock = async (resource) => {
        return locks.acquire(resource, context)
    }

    context.setProgress = async (value, outOf) => {
        if (!context.task) {
            return
        }

        let task = await db.task.findById(task.id)
        task.progress = Math.floor(100 * value / outOf)
        contenxt.task = await task.save()
    }

    context.where = () => {
        let clause = {}

        // if (context.organization) {
        //     clause.organization = context.organization.id
        // }

        if (context.tenant) {
            clause.tenant = context.tenant.id
        }

        let filters = {}
        filters.add = (key, value) => {
            if (value !== undefined) {
                clause[key] = value
            }
            return clause
        }

        filters.clause = clause

        return filters
    }

    log.end()

    return context
}

exports.serializer = async (context) => {
    let serialized = {}

    if (context.user) {
        serialized.userId = context.user.id
    }

    if (context.tenant) {
        serialized.tenantId = context.tenant.id
    }

    if (context.organization) {
        serialized.organizationId = context.organization.id
    }

    return serialized
}

exports.deserializer = async (serialized, logger) => {
    let claims = {}

    if (serialized.userId) {
        claims.user = {
            id: serialized.userId
        }
    }

    if (serialized.organizationId) {
        claims.organization = {
            id: serialized.organizationId
        }
    }

    if (serialized.tenantId) {
        claims.tenant = {
            id: serialized.tenantId
        }
    }

    return exports.create(claims, logger)
}
