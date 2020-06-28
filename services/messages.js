'use strict'
const db = require('../models')
const templates = require('./templates')
const documents = require('./documents')
const users = require('./users')

var formatter = require('../helpers/template').formatter
const offline = require('@open-age/offline-processor')

const conversations = require('./conversations')

const validator = require('validator')

let populate = 'from to organization conversation'

const set = async (model, entity, context) => {
    if (model.status) {
        entity.status = model.status
    }

    if (model.subject) {
        entity.subject = model.subject
    }

    if (model.body && (!entity.to || !entity.to.length)) {
        entity.body = model.body
    }
}

const extractContext = (context) => {

    const pic = (item) => {
        item = item || {}
        return {
            url: item.url,
            thumbnail: item.thumbnail
        }
    }

    let result = {}

    if (context.tenant) {
        result.tenant = {
            id: context.tenant.id,
            code: context.tenant.code,
            name: context.tenant.name,
            logo: pic(context.tenant.logo)
        }
    }

    if (context.organization) {
        result.organization = {
            id: context.organization.id,
            code: context.organization.code,
            shortName: context.organization.shortName,
            name: context.organization.name,
            logo: pic(context.organization.logo),
            address: {}
        }

        if (context.organization.address) {
            result.organization.address = {
                line1: result.organization.address.line1,
                line2: result.organization.address.line2,
                district: result.organization.address.district,
                city: result.organization.address.city,
                state: result.organization.address.state,
                pinCode: result.organization.address.pinCode,
                country: result.organization.address.country
            }
        }
    }

    if (context.user) {
        result.user = {
            id: context.user.id,
            code: context.user.code,
            email: context.user.email,
            phone: context.user.phone,
            profile: {
                firstName: context.user.profile.firstName,
                lastName: context.user.profile.lastName,
                pic: pic(context.user.profile.pic)
            },
            role: {
                id: context.user.role.id,
            }
        }
    }

    return result
}

const injectDataInMeta = (meta, data, context) => {

    data = data || {}
    data.context = extractContext(context)
    meta = JSON.parse(formatter(JSON.stringify(meta)).inject(data))

    meta.dp = meta.dp || ''
    meta.isHidden = !!meta.isHidden
    meta.action = meta.actions || []
    meta.logo = meta.logo || ''
    meta.category = meta.category || ''
    return meta

    // let actions = meta.actions.map(action => {
    //     return action ? JSON.parse(formatter(JSON.stringify(action)).inject(data)) : ''
    // })

    // let parsedMeta = {
    //     dp: meta.dp ? formatter(meta.dp).inject(data) : '',
    //     isHidden: !!meta.isHidden,
    //     actions: actions,
    //     logo: meta.logo ? formatter(meta.logo).inject(data) : '',
    //     category: meta.category ? formatter(meta.category).inject(data) : ''
    // }

    // return parsedMeta
}
const extract = (item, field) => {
    let value = item
    field.split('.').forEach(part => {
        value = value[part]
    });
    return value
}

const getAttachment = async (item, context) => {
    if (item.template) {
        let buffer
        let mimeType
        if (item.model) {
            let type = item.type

            if (!type) {
                let parts = item.filename.split('.')
                type = parts[parts.length - 1]
            }

            switch (item.type) {
                case 'application/pdf':
                case 'pdf':
                    buffer = await documents.getPdfByModel(item.model, item.template, context)
                    mimeType = 'application/pdf'
                    break
                default:
                    buffer = await documents.getDocxByModel(item.model, item.template, context)
                    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    break
            }
        } else if (item.id) {
            buffer = await documents.getPdfByDataId(item.id, item.template, context)
            mimeType = 'application/pdf'
        }

        return {
            filename: item.filename,
            mimeType: mimeType,
            content: buffer
        }
    } else if (item.content) {
        return {
            filename: item.filename,
            content: item.content
        }
    } else if (item.url) {
        return {
            filename: item.filename || item.name || item.fileName,
            mimeType: item.MimeType || item.MIMEtype || item.MIMEType || item.mimeType || item.type,
            thumbnail: item.thumbnail || item.data,
            description: item.description,
            url: item.url
        }
    } else if (validator.isURL(item)) {
        // todo get meta from the url
        return {
            mimeType: 'text/html',
            url: item
        }
    } else {
        return {
            mimeType: 'text/plain',
            description: item
        }
    }
}
exports.create = async (model, context) => {

    let log = context.logger.start('create')

    let template
    if (model.template) {
        template = await templates.get(model.template, context)

        if (!template) {
            log.info(`template: ${model.template.code || model.template.id || model.template} does not exit`)
            log.end()
            return
        }
    }

    let options = model.options || {}

    let meta = model.meta || {}

    let message = {
        data: model.data || {},
        subject: model.subject,
        body: model.body,
        modes: model.modes || options.modes,
        attachments: [],
        isHidden: options.isHidden,
        date: new Date(),
        organization: context.organization,
        tenant: context.tenant,
        externalId: model.externalId
    }

    if (model.attachments && model.attachments.length) {
        message.attachments = []
        for (const item of model.attachments) {
            message.attachments.push(await getAttachment(item, context))
        }
    }

    if (template) {
        template.config = template.config || {}
        message.modes = model.modes || template.config.modes
        message.isHidden = template.config.isHidden

        meta.dp = meta.dp || template.dp
        meta.isHidden = meta.isHidden || options.isHidden || template.isHidden
        meta.actions = (meta.actions || template.actions || []).map(i => i) // remove any mongoose properties
        meta.logo = meta.logo || template.logo
        meta.category = meta.category || template.category

        if (template.category !== 'view') {
            let doc = await documents.getDocByTemplate(model.data, template, context)
            message.subject = doc.name
            message.body = doc.content
        }
    }

    if (model.from) {
        message.from = await users.get(model.from, context)
    } else if (template && model.data && template.config.from) {
        let userCode = config.from.field ? extract(model.data, template.config.from.field) : template.config.from
        message.from = await users.get(userCode, context)
    } else if (context.user) {
        message.from = context.user
    } else if (context.organization && context.organization.owner) {
        message.from = context.organization.owner
    } else if (context.tenant && context.tenant.owner) {
        message.from = context.tenant.owner
    }

    if (message.from) {
        meta.from = { role: { id: message.from.role.id } }
    }

    if (model.conversation) {
        message.conversation = await conversations.get(model.conversation, context)
        if (message.conversation) {
            meta.entity = meta.entity || message.conversation.entity
            meta.conversationId = message.conversation.id
        }
    }

    message.to = []

    const addUser = async (item) => {
        if (!item) {
            return
        }

        if (item.id) { // TODO: fix send-it client to send the role id as object
            item = {
                role: item
            }
        }

        let user = await users.get(item.user || item, context)
        if (user && !message.to.find(i => i.user.code === user.code)) {
            message.to.push({
                user: user
            })
        }
    }

    if (model.to === 'everyone') {
        if (message.conversation) {
            for (let item of message.conversation.participants) {
                await addUser({ code: item.code })
            }
        }
    } else if (model.to) {
        if (Array.isArray(model.to)) {
            for (let item of model.to) {
                if (item === 'everyone') {
                    if (message.conversation) {
                        for (let item of message.conversation.participants) {
                            await addUser({ code: item.code })
                        }
                    }
                } else {
                    await addUser(item)
                }
            }
        } else if (model.data && model.to.field) {
            let to = extract(model.data, model.to.field)
            for (let item of to.split(',')) {
                await addUser(item)
            }
        } else {
            await addUser(model.to.user || model.to)
        }
    } else if (model.data && !model.to && template && template.config && template.config.to) {

        let to = template.config.to.field ? extract(model.data, template.config.to.field) : template.config.to
        for (let item of to.split(',')) {
            await addUser(item)
        }
    }

    if (options.to) {
        if (Array.isArray(options.to)) {
            meta.to = options.to.map(t => {
                return { user: t }
            })
        } else {
            meta.to = [{ user: options.to }]
        }
    }

    message.meta = injectDataInMeta(meta, model.data, context)

    let entity = new db.message(message)
    await entity.save()
    if (message.conversation) {
        message.conversation.lastMessage = entity.id
        await message.conversation.save()
    }
    if (!entity.externalId) {
        await offline.queue('message', 'create', entity, context)
    }
    log.end();
    return entity
}


exports.search = async (query, page, context) => {
    let where = {
        tenant: context.user.tenant
    }
    let sort = 'date'
    let sortOrder = -1;

    if (query.sort) {
        sort = (query.sort).toString();
        sortOrder = query.sortOrder;
    }

    var sortQuery = {};
    sortQuery[sort] = sortOrder;
    if (query.status) {
        // TODO:
        // where.to = {
        //     user: context.user,
        //     archivedOn: $exists
        // }
        where['status'] = query.status
    }

    if (query.mode) {
        switch (query.mode) {
            case 'sms':
                where['modes.sms'] = true
                break
            case 'email':
                where['modes.email'] = true
                break
            case 'push':
                where['modes.push'] = true
                break
            case 'notes':
                where['$or'] = [{ to: { $exists: false } }, { to: { $size: 0 } }]
                break
        }
    }

    if (query.conversation) {
        where['conversation'] = await conversations.get(query.conversation, context)
    }

    if (query.to) {
        where['to.user'] = await users.get(query.to, context)
    }

    if (!where.conversation && !where['to.user'] && (where['to.user'] && where['to.user'].id !== context.user.id)) {
        // user can get messages beyond his organization if
        // a. he is asking for a specific conversation
        // b. he is asking for his messages
        where.organization = context.organization
    }

    if (!page || !page.limit) {
        return {
            items: await db.message.find(where).sort(sortQuery).populate(populate),
            count: await db.message.count(where)
        }
    }

    return {
        items: await db.message.find(where).sort(sortQuery).limit(page.limit).skip(page.skip).populate(populate),
        count: await db.message.count(where)
    }
}

exports.update = async (id, model, context) => {
    let entity = await db.message.findById(id)
    await set(model, entity, context)
    return entity.save()
}

exports.get = async (query, context) => {
    if (typeof query === 'string') {
        if (query.isObjectId()) {
            return db.message.findById(query).populate('from to.user')
        }
    }
    if (query.id) {
        return db.job.findById(query.id).populate('from to.user')
    }
    if (query.externalId) {
        return db.message.find(query.externalId).populate('from to.user')
    }

    return null

}

exports.remove = async (id, context) => {
    return db.message.remove({ _id: id });
}
