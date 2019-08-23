'use strict'
const db = require('../models')
const templates = require('./templates')
const documents = require('./documents')
const users = require('./users')

var formatter = require('../helpers/template').formatter
const offline = require('@open-age/offline-processor')

const conversations = require('./conversations')

const validator = require('validator')
const set = async (model, entity, context) => {
    if (model.status) {
        entity.status = model.status
    }

    if (model.body && (!entity.to || !entity.to.length)) {
        entity.body = model.body
    }
}

const injectDataInMeta = (meta, data) => {
    let actions = meta.actions.map(action => {
        return action ? JSON.parse(formatter(JSON.stringify(action)).inject(data)) : ''
    })

    let parsedMeta = {
        dp: meta.dp ? formatter(meta.dp).inject(data) : '',
        isHidden: !!meta.isHidden,
        actions: actions,
        logo: meta.logo ? formatter(meta.logo).inject(data) : '',
        category: meta.category ? formatter(meta.category).inject(data) : ''
    }

    return parsedMeta
}

const extract = (item, field) => {
    let value = item
    field.split('.').forEach(part => {
        value = value[part]
    });
    return value
}

exports.create = async (model, context) => {
    let log = context.logger.start('create')

    let message = {
        data: model.data || {},
        subject: model.subject,
        body: model.body,
        modes: model.modes,
        attachments: [],
        isHidden: false,
        meta: {},
        date: new Date(),
        organization: context.organization,
        tenant: context.tenant
    }

    if (model.attachments && model.attachments.length) {
        message.attachments = model.attachments.map(a => {
            if (!a.url) {
                if (validator.isURL(a)) {
                    // todo get meta from the url
                    return {
                        MIMEtype: 'text/html',
                        url: a
                    }
                } else {
                    return {
                        MIMEtype: 'text/plain',
                        description: a
                    }
                }
            }

            return {
                MIMEtype: a.type || a.MimeType || MIMEtype,
                thumbnail: a.thumbnail || a.data,
                description: a.description,
                url: a.url
            }
        })
    }

    let template
    if (model.template) {
        template = await templates.get(model.template, context)
    }

    if (template) {
        template.config = template.config || {}
        message.modes = model.modes || template.config.modes
        message.isHidden = template.config.isHidden

        message.meta = injectDataInMeta({
            dp: template.dp,
            isHidden: template.isHidden,
            actions: template.actions,
            logo: template.logo,
            category: template.category
        }, model.data || {})
        let doc = await documents.getDocByTemplate(model.data, template, context)
        message.subject = doc.name
        message.body = doc.content
    }

    if (model.from) {
        message.from = await users.get(model.from, context)
    } else if (template && model.data && template.config.from) {
        let userCode = config.from.field ? extract(model.data, template.config.from.field) : template.config.from
        message.from = await users.get(userCode, context)
    } else {
        message.from = context.user
    }

    if (message.from) {
        message.meta.from = { role: { id: message.from.role.id } }
    }

    message.conversation = await conversations.get(model.conversation, context)
    if (message.conversation) {
        message.meta.entity = message.conversation.entity
    }

    message.to = []

    if (model.to === 'everyone') {
        for (let item of conversation.participants) {
            let user = await users.get(item, context)
            message.to.push({
                user: user
            })
        }
    } else if (model.to && model.to.length) {
        for (let item of model.to) {
            let user = await users.get(item.user || item, context)
            if (user) {
                message.to.push({
                    user: user
                })
            }
        }
    } else if (model.data && model.to && model.to.field) {
        let to = extract(model.data, model.to.field)
        for (let item of to.split(',')) {
            let user = await users.get(item, context)
            if (user) {
                message.to.push({
                    user: user
                })
            }
        }

    } else if (model.data && !model.to && template && template.config && template.config.to) {

        let to = template.config.to.field ? extract(model.data, template.config.to.field) : template.config.to
        for (let item of to.split(',')) {
            let user = await users.get(item, context)
            message.to.push({
                user: user
            })
        }
    }

    let entity = new db.message(message)
    await entity.save()
    await offline.queue('message', 'create', entity, context)
    log.end()
    return entity
}

exports.search = async (query, page, context) => {
    let where = context.where()

    // if (context.organization) {
    //     where.add('organization', context.organization)
    // }

    if (query.status) {
        // TODO:
        // where.to = {
        //     user: context.user,
        //     archivedOn: $exists
        // }
        where.add('status', query.status)
    }

    if (query.mode) {
        switch (query.mode) {
            case 'sms':
                where.add('modes.sms', true)
                break
            case 'email':
                where.add('modes.email', true)
                break
            case 'push':
                where.add('modes.push', true)
                break
            case 'notes':
                where.add('$or', [{ to: { $exists: false } }, { to: { $size: 0 } }])
                break
        }
    }

    if (query.conversationId) {
        let conversation = await conversations.get({
            id: query.conversationId
        }, context)

        where.add('conversation', conversation)
    }

    if (query.to || query.to_email) {
        let userQuery

        if (query.to) {
            userQuery = query.to
        } else if (query.to_email) {
            userQuery = { email: query.to_email }
        }

        let user = await users.get(userQuery, context)

        if (user.status !== 'temp') {
            where.add('to.user', user.id)
        }
    }

    if (!page || !page.limit) {
        return {
            items: await db.message.find(where.clause).sort({ date: -1 }).populate('from organization')
        }
    }

    return {
        items: await db.message.find(where.clause).sort({ date: -1 }).limit(page.limit).skip(page.skip).populate('from organization'),
        count: await db.message.count(where.clause)
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
    return null

}

exports.remove = async (id, context) => {
    return db.message.remove({ _id: id });
}
