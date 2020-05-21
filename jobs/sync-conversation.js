'use strict'
const logger = require('@open-age/logger')('JOB sync-conversation');
const cron = require('cron').CronJob;
const offline = require('@open-age/offline-processor');
const db = require('../models');
const contextBuilder = require('../helpers/context-builder');
const syncConversations = async (orgCodes) => {
    var conversations = await db.conversation.find({
        'config.chat': { $exists: true },
        status: 'active'
    }).populate('tenant organization');

    logger.debug(`${conversations.length} conversation(s) to sync`)

    for (const conversation of conversations) {
        var context = await contextBuilder.create({
            logger: logger,
            tenant: conversation.tenant,
            organization: conversation.organization
        })
        try {
            await offline.queue('conversation', 'sync', conversation, context)
        } catch (error) {
            context.logger.error(error)
        }
    }
}

// async function asyncForEach(array, callback) {
//     for (let index = 0; index < array.length; index++) {
//         await callback(array[index], index, array);
//     }
// }

const start = (orgCodes) => {
    logger.info('starting job')
    setTimeout(() => {
        logger.info('starting sync')
        syncConversations(orgCodes).then(() => {
            console.log('restarting the sync')
            start(orgCodes)
        })
    }, 10000)
}
exports.schedule = (orgCodes) => {
    start(orgCodes)
}

exports.run = async (orgCodes) => {
    await syncConversations(orgCodes)
}
