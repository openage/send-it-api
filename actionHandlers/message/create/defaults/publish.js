'use strict'
const channels = require('../../../../services/channels')
exports.process = async (message, context) => {
    let log = context.logger.start(`actionHandlers/message/create/defaults/update-channels message: ${message.id}`)
    let conversation = message.conversation

    if (!conversation) {
        return
    }

    let config = conversation.config
    let messageModified = false
    let conversationModified = false

    if (config.chat && !message.externalId) {

        let chatChannel = await channels.getByMode('chat', context)
        let chatProvider = chatChannel ? require('../../../../providers/' + chatChannel.provider.code).config(chatChannel.config) : null

        if (chatProvider && chatProvider.publish) {
            let result = await chatProvider.publish(message, config.chat.config)
            message.externalId = result.id
            if (!config.chat.config.lastSyncTime) {
                config.chat.config.lastSyncTime = result.timeStamp
                conversation.markModified('config.chat.config')
                conversationModified = true
            }
            messageModified = true
        }

        // messageModified = true
        // if (conversation.config.chat && !conversation.config.chat.config.lastSync) {
        //     conversation.config.chat.config.lastSync = message.externalId;
        //     conversationModified = true;
        // }
    }

    if (config.push) {
        config.push.config = config.push.config || {}
        if (!config.push.config.topic && conversation.entity && conversation.entity.id && conversation.entity.type) {
            config.push.config.topic = `${conversation.entity.type}-${conversation.entity.id}` // TODO: dot or dash
        }

        let pushChannel = await channels.getByMode('push', context)
        let pushProvider = pushChannel ? require('../../../../providers/' + pushChannel.provider.code).config(pushChannel.config) : null
        if (pushProvider && pushProvider.publish) {
            await pushProvider.publish(message, config.push.config)
        }
    }

    if (messageModified) {
        await message.save()
    }

    if (conversationModified) {
        await conversation.save()
    }
    log.end()
}
