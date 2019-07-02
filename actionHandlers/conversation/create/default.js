'use strict'

const logger = require('@open-age/logger')('actionHandlers/conversation')
const messages = require('../../../services/messages')

exports.process = function (data, context, cb) {
    let log = logger.start('process')

    messages.process(data.id, context)
        .then((messages) => {
            log.info('messages prcessed:' + messages)
            return cb()
        })
        .catch((err) => {
            log.error(err)
            return cb(err)
        })
}
