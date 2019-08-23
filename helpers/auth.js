'use strict'

const contextBuilder = require('./context-builder')
const userService = require('../services/users')

const fetch = (req, modelName, paramName) => {
    var value = req.query[`${modelName}-${paramName}`] || req.headers[`x-${modelName}-${paramName}`]
    if (!value && req.body[modelName]) {
        value = req.body[modelName][paramName]
    }
    if (!value) {
        return null
    }

    var model = {}
    model[paramName] = value
    return model
}

const extractFromRoleKey = async (roleKey, logger) => {
    let log = logger.start('extractRoleKey')

    let user = await userService.getByKey(roleKey, log)

    if (!user) {
        throw new Error('invalid role key')
    }

    if (user.id) { // some users does not exist in db
        user.lastSeen = new Date()
        await user.save()
    }

    log.end()
    return user
}

const requireRoleKey = async (req, res, next, permission) => {
    let log = res.logger.start(`helpers/auth:shouldHavePermission(${permission})`)

    var role = fetch(req, 'role', 'key')

    if (!role) {
        return res.accessDenied('ROLE_KEY_MISSING')
    }

    extractFromRoleKey(role.key, log).then(user => {
        contextBuilder.create({
            user: user,
            organization: user.organization,
            tenant: user.tenant
        }, res.logger).then(context => {
            // if (!context.hasPermission(permission)) {
            //     res.accessDenied()
            // } else {
            req.context = context
            next()
            // }
        })
    }).catch(err => {
        log.error(err)
        res.failure('ROLE_KEY_IS_INVALID')
    })
}

exports.requiresCaptcha = (req, res, next) => {
    let log = logger.start('requiresCaptcha')

    let token = req.body.roleKey || req.query.roleKey || req.headers['x-google-captcha'] // todo for google captcha

    var tenant = fetch(req, 'tenant', 'code')
    var organization = fetch(req, 'organization', 'code')

    if (!tenant) {
        return res.accessDenied('TENANT_CODE_IS_INVALID')
    }
    contextBuilder.create({
        tenant: tenant,
        organization: organization
    }, res.logger).then(context => {
        req.context = context
        next()
    }).catch(err => res.accessDenied(err))
}

exports.requiresAny = (req, res, next) => {
    let log = res.logger.start(`helpers/auth:requiresAny`)
    var role = fetch(req, 'role', 'key')

    if (role) {
        return requireRoleKey(req, res, next)
    }

    var tenant = fetch(req, 'tenant', 'code')
    if (!tenant) {
        return res.accessDenied('TENANT_CODE_MISSING')
    }

    contextBuilder.create({
        tenant: tenant
    }, res.logger).then(context => {
        if (!context.tenant) {
            res.failure('TENANT_CODE_IS_INVALID')
        } else {
            req.context = context
            next()
        }
    })
}

exports.requiresRole = (req, res, next) => {
    requireRoleKey(req, res, next)
}

exports.requiresOrganizationAdmin = (req, res, next) => {
    requireRoleKey(req, res, next, ['organization.admin', 'organization.superadmin'])
}

exports.requiresTenantAdmin = (req, res, next) => {
    requireRoleKey(req, res, next, 'tenant.admin')
}

exports.requiresAdmin = (req, res, next) => {
    requireRoleKey(req, res, next, ['system.admin', 'tenant.admin', 'organization.admin', 'organization.superadmin'])
}

exports.requiresSystemAdmin = (req, res, next) => {
    requireRoleKey(req, res, next, 'system.admin')
}
