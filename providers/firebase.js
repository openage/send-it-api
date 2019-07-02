'use strict'
const admin = require('firebase-admin')
const logger = require('@open-age/logger')('providers/firebase')

var send = async (message, device, config) => {
    let log = logger.start('push')

    if (!admin.apps.length) {
        admin.initializeApp({ credential: admin.credential.cert(config) })
    }

    message.meta.subject = message.subject
    message.meta.title = message.subject
    message.meta.body = message.body

    const pushMessage = {
        // notification: {
        //   title: message.subject,
        //   body: message.body
        // },
        data: {
            meta: JSON.stringify(message.meta)
        }
    }

    return admin.messaging().sendToDevice([device.id], pushMessage)
        .then((response) => {
            log.debug(response)
            return true
        })
        .catch((error) => {
            log.error(error)
            return false
        })
}

exports.config = function (config) {
    return {
        send: async (message, device) => {
            return send(message, device, config)
        }
    }
}
