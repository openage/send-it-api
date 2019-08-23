'use strict'
const db = require('../models')
const contextBuilder = require('../helpers/context-builder')
const organizations = require('./organizations')
const tenants = require('./tenants')

const system = require('config').get('system')
const directory = require('@open-age/directory-client')

const validator = require('validator')

const set = async (model, entity, context) => {
    if (model.status) {
        entity.status = model.status
    }

    if (model.email && validator.isEmail(model.email)) {
        entity.email = model.email.toLowerCase().replace(' ', '')
    }

    if (model.phone && validator.isMobilePhone(model.phone)) {
        entity.phone = model.phone.trim().replace(' ', '')
    }

    if (model.userId) {
        entity.trackingId = model.userId
    }

    if (model.code) {
        entity.code = model.code
    }

    if (model.profile) {
        entity.profile.firstName = model.profile.firstName
        entity.profile.lastName = model.profile.lastName
        entity.profile.gender = model.profile.gender
        entity.profile.dob = model.profile.dob
        model.profile.pic = model.profile.pic || {}
        entity.profile.pic = {
            url: model.profile.pic.url,
            thumbnail: model.profile.pic.thumbnail
        }
    }

    if (model.address) {
        entity.address.line1 = model.address.line1
        entity.address.line2 = model.address.line2
        entity.address.district = model.address.district
        entity.address.city = model.address.city
        entity.address.state = model.address.state
        entity.address.pinCode = model.address.pinCode
        entity.address.country = model.address.country
    }

    if (model.role) {
        if (entity.role.id && model.role.id && model.role.id !== entity.role.id) {
            // role id cannot be changed
            throw new Error('ID_UNMUTABLE')
        } else if (!entity.role.id && model.role.id) {
            entity.role.id = model.role.id
        }
        if (model.role.key) {
            entity.role.key = model.role.key
        }

        if (model.role.code) {
            entity.role.code = model.role.code
        }

        if (model.role.permissions) {
            entity.role.permissions = model.role.permissions
        }
    }
    if (model.chat) {
        entity.chat = entity.chat || {}

        if (model.chat.id) {
            entity.chat.id = model.chat.id
        }

        if (model.chat.key) {
            entity.chat.key = model.chat.key
        }

        if (model.chat.statusMessage) {
            entity.chat.statusMessage = model.chat.statusMessage
        }
    }

    if (model.devices && model.devices.length) {
        model.devices.forEach(deviceModel => {
            let device = entity.devices.find(item => item.id === deviceModel.id)
            if (!device) {
                device = {
                    id: deviceModel.id, // firebase or one signal token
                    name: deviceModel.name,
                    status: deviceModel.status || 'active'
                }
                entity.devices.push(device)
            }

            device.name = deviceModel.name
            device.status = deviceModel.status || 'active'
        })
    }

    if (model.notifications) {
        if (model.notifications.enabled !== undefined) {
            entity.notifications.enabled = model.notifications.enabled
        }

        if (model.notifications.snooze) {
            entity.notifications.snooze = model.notifications.snooze
        }

        if (model.notifications.refusals && model.notifications.refusals.length) {
            model.notifications.refusals.forEach(refusal => {
                let refused = entity.notifications.refusals.find(item => item === refusal)
                if (!refused) {
                    model.notifications.refusals.push(refusal)
                }
            })
        }
    }
}

exports.create = async (model, context) => {
    let user = null

    if (model.userId) {
        user = await exports.get({ trackingId: model.userId }, context)
    }

    if (!user && model.email) {
        user = await db.user.findOne({
            email: model.email.toLowerCase(),
            tenant: context.tenant,
            organization: context.organization,
        }).populate('tenant organization')
    }

    if (!user && model.phone) {
        user = await db.user.findOne({
            email: model.phone.trim(),
            tenant: context.tenant,
            organization: context.organization,
        }).populate('tenant organization')
    }

    if (!user) {
        user = new db.user({
            role: {},
            profile: {},
            address: {},
            devices: [],
            notifications: context.organization ? context.organization.notifications : context.tenant.notifications,
            tenant: context.tenant,
            organization: context.organization,
            status: 'new'
        })
    }

    await set(model, user, context)
    return user.save()
}

exports.update = async (id, model, context) => {
    let entity = await exports.get(id, context)
    await set(model, entity, context)
    return entity.save()
}

exports.getByKey = async (roleKey, logger) => {
    let log = logger.start('services/users:getByKey')

    if (roleKey === system.key) {
        return {
            _doc: {}, // just to simulate db
            name: 'System Admin',
            email: system.email,
            phone: system.phone,
            role: {
                permissions: ['system.admin', 'tenant.admin', 'organization.admin']
            }
        }
    }

    let user = await db.user.findOne({
        'role.key': roleKey
    }).populate('organization tenant')

    if (user) { return user }

    let role = await directory.getRole(roleKey)

    logger.debug(role)

    if (!role) {
        throw new Error('ROLE_KEY_IS_INVALID')
    }

    const context = await contextBuilder.create({}, logger)

    let tenant = await tenants.getOrCreate({
        code: role.tenant.code,
        name: role.tenant.name
    }, context)

    await context.setTenant(tenant)

    if (role.organization) {
        let organization = await organizations.getOrCreate({
            code: role.organization.code,
            name: role.organization.name,
            email: role.organization.email,
            phone: role.organization.phone,
            shortName: role.organization.shortName,
            address: role.organization.address,
            logo: role.organization.logo
        }, context)
        await context.setOrganization(organization)
    }

    user = await exports.create({
        role: {
            id: role.id,
            code: role.code,
            key: role.key,
            permissions: role.permissions
        },
        code: role.code,
        email: role.email,
        phone: role.phone,
        profile: role.profile,
        address: role.address
    }, context)

    log.end()
    return user
}

exports.getByRoleId = async (roleId, context) => {
    let log = logger.start('services/users:getByKey')

    let user = await db.user.findOne({
        'role.id': roleId
    }).populate('organization tenant')

    if (user) { return user }

    let role = await directory.getRoleById(roleId)

    logger.debug(role)

    if (!role) {
        throw new Error('role not found')
    }

    if (role.tenant.code !== context.tenant.code) {
        throw new Error('ROLE_ID_IS_INVALID')
    }

    if (role.organization && context.organization && role.organization.code !== context.organization.code) {
        throw new Error('ROLE_ID_IS_INVALID')
    }

    user = await exports.create({
        role: {
            id: role.id,
            code: role.code,
            key: role.key,
            permissions: role.permissions
        },
        code: role.code,
        email: role.email,
        phone: role.phone,
        profile: role.profile,
        address: role.address
    }, context)
    log.end()
    return user
}

exports.get = async (query, context) => {
    let where = {
        tenant: context.tenant,
        organization: context.organization
    }
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.user.findById(query).populate('tenant organization')
        } else {
            if (query === 'me') {
                return context.user
            }
            where.code = query.toLowerCase()
            return db.user.findOne(where).populate('tenant organization')
        }
    }

    if (query._doc) {
        return query
    }

    if (query.id) {
        if (query.id === 'me') {
            return context.user
        }
        return db.user.findById(query).populate('tenant organization')
    }

    if (query.code) {
        where.code = query.code.toLowerCase()
        return db.user.findOne(where).populate('tenant organization')
    }

    if (query.role && model.role.id) {
        return getByRoleId(model.roleId || model.role.id, context)
    }

    let user

    if (query.email) {
        let email = query.email.toLowerCase()
        user = await db.user.findOne({
            email: email,
            tenant: context.tenant
        }).populate('tenant organization')

        if (!user) {
            user = await (new db.user({
                role: {},
                code: email,
                email: email,
                profile: {},
                address: {},
                devices: [],
                tenant: context.tenant,
                status: 'temp'
            }).save())
        }

        return user
    }

    if (query.phone) {
        let phone = query.phone
        user = await db.user.findOne({
            phone: phone,
            tenant: context.tenant
        }).populate('tenant organization')
        if (!user) {
            user = await (new db.user({
                role: {},
                code: phone,
                phone: phone,
                profile: {},
                address: {},
                devices: [],
                tenant: context.tenant,
                status: 'temp'
            }).save())
        }
        return user
    }

    if (query.trackingId) {
        where.trackingId = query.trackingId
        return db.user.findOne(where).populate('tenant organization')
    }

    return null
}

exports.search = async (query, page, context) => {
    let where = {
        tenant: context.tenant,
        organization: context.organization
    }

    if (query.text) {
        if (validator.isEmail(query.text)) {
            where.email = query.text.toLowerCase()
        } else if (validator.isMobilePhone(query.text)) {
            where.phone = query.text.trim().replace(' ', '')
        }
    }

    return {
        items: await (page ? db.user.find(where).skip(page.skip).limit(page.limit) : db.user.find(where)),
        count: await db.user.count(where)
    }
}
