'use strict'
var nodemailer = require('nodemailer')
var mailgunTransport = require('nodemailer-mailgun-transport')
var emailConfig = require('config').get('email')
var logger = require('@open-age/logger')('mailgun')

const userToEmail = user => {
    if (!user.profile) {
        return user.email
    }

    let name = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()

    if (!name) {
        return user.email
    }
    return `${name}<${user.email}>`
}


const send = async (message, to, config) => {
    var log = logger.start('send')
    if (!to) {
        log.error(`missing email`)
        return Promise.resolve(false)
    }

    if (emailConfig.disabled) {
        log.info('email disabled')
        return Promise.resolve(false)
    }

    var payload = {
        from: userToEmail(message.from),
        to: userToEmail(to),
        subject: message.subject,
        html: message.body
    }

    if (message.attachments.length) {
        payload.attachments = message.attachments
    }

    const transporter = nodemailer.createTransport(mailgunTransport({
        service: 'Mailgun',
        auth: config
    }))

    return new Promise((resolve) => {
        transporter.sendMail(payload, function (err) {
            if (err) {
                log.error('error while sending email', {
                    payload: payload,
                    error: err
                })
                resolve(false)
            } else {
                log.info('sent email')
                resolve(true)
            }
        })
    })
}

exports.config = function (config) {
    return {
        send: async (message, to) => {
            return send(message, to, config)
        }
    }
}
