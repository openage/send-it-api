'use strict'
const messageService = require('../../services/messages')
const channels = require('../../services/channels')
exports.process = async (conversation, context) => {
    let log = context.logger.start(`actionHandlers/conversation/sync conversation:${conversation.id}`)

    if (!conversation.config || !conversation.config.chat || !conversation.config.chat.config || !conversation.config.chat.config.lastSyncTime) {
        log.info(`will sync once the 'config.chat.config.lastSyncTime' has been set`)
        log.end()
        return
    }

    // sync only chat messages
    let chatChannel = await channels.getByMode('chat', context)
    if (!chatChannel) {
        return
    }

    let chatProvider = require('../../providers/' + chatChannel.provider.code).config(chatChannel.config)
    if (!chatProvider) {
        return
    }

    var config = conversation.config.chat.config

    let messages = await chatProvider.search({
        from: config.lastSyncTime
    }, config);

    if (!messages.length) {
        return
    }

    log.debug(`${messages.length} message(s) to sync`)

    var timeStamp = null

    for (var message of messages) {
        await messageService.create({
            modes: {
                sms: false,
                email: false,
                push: false,
                chat: true
            },
            subject: message.subject,
            conversation: conversation,
            externalId: message.id,
            from: message.from
        }, context)

        timeStamp = message.timeStamp;
    }

    if (timeStamp) {
        conversation.config.chat.config.lastSyncTime = timeStamp
        conversation.markModified('config.chat.config')
        await conversation.save()
    }

    log.end()
}
