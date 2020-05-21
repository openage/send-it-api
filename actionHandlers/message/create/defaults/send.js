const channels = require('../../../../services/channels')
const validator = require('validator')

const isEmailValid = (emailId) => {
    if (!emailId) {
        return false
    }
    var pattern = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
    if (!pattern.test(emailId)) {
        return false
    }

    if (!validator.isEmail(emailId)) {
        return false
    }

    return !['noreply', 'no-reply', 'no_reply', 'not_set', 'notset', 'not-set'].find(junk => emailId.startsWith(junk))
}

const isMobileValid = (mobile) => {
    if (!mobile) {
        return false
    }
    var pattern = /^(\+\d{1,3}[- ]?)?\d{10}$/

    if (!pattern.test(mobile)) {
        return false
    }

    var junks = ['1', '2', '3', '4', '5', '6666666666', '7777777777', '8888888888', '9999999999', '9876543210']
    var countryCode = mobile.startsWith('+')
    if (countryCode) {
        return !junks.find(junk => mobile.substring(3).startsWith(junk))
    } else {
        return !junks.find(junk => mobile.startsWith(junk))
    }
}

const isDeviceValid = (device) => {
    if (device && device.id && device.status == 'active') {
        return true
    } else {
        return false
    }
}

const isChatValid = (chatId) => {
    if (!chatId) {
        return false
    }

    return true
}

const send = async (user, message, providers, context) => {
    let isDelivered = false
    let externalId = null

    if (providers.push && user.devices) {
        for (let device of user.devices) {
            if (isDeviceValid(device)) {
                context.logger.debug(`sending push to ${device.id}`)
                if (await providers.push.send(message, device)) {
                    isDelivered = true
                    continue
                }
            }
        }
    }

    if (!isDelivered && providers.email && user.email && isEmailValid(user.email)) {
        context.logger.debug(`sending email to ${user.email}`)
        isDelivered = await providers.email.send(message, user)
    }

    if (!isDelivered && providers.sms && user.phone && isMobileValid(user.phone)) {
        context.logger.debug(`sending sms to ${user.phone}`)
        isDelivered = await providers.sms.send(message, user)
    }

    if (!isDelivered && providers.chat && user.chatId && isChatValid(user.chatId)) {
        context.logger.debug(`sending chat to ${user.chatId}`)
        let chatMessage = await providers.chat.send(message, user)

        if (chatMessage) {
            externalId = chatMessage.id
            isDelivered = true
        }
    }

    return {
        isDelivered: isDelivered,
        externalId: externalId
    }
}

exports.process = async (message, context) => {
    if (!(message.to && message.to.length) && !(message.meta.to && message.meta.to.length)) {
        return
    }
    let log = context.logger.start(`process message: ${message.id}`)


    let emailChannel = message.modes.email ? await channels.getByMode('email', context) : null
    let smsChannel = message.modes.sms ? await channels.getByMode('sms', context) : null
    let chatChannel = message.modes.chat ? await channels.getByMode('chat', context) : null
    let pushChannel = message.modes.push ? await channels.getByMode('push', context) : null

    let providers = {
        email: emailChannel ? require('../../../../providers/' + emailChannel.provider.code).config(emailChannel.config) : null,
        sms: smsChannel ? require('../../../../providers/' + smsChannel.provider.code).config(smsChannel.config) : null,
        push: pushChannel ? require('../../../../providers/' + pushChannel.provider.code).config(pushChannel.config) : null,
        chat: chatChannel ? require('../../../../providers/' + chatChannel.provider.code).config(chatChannel.config) : null
    }

    if (message.modes.email && !providers.email) {
        context.logger.info(`email channel not set`)
    }

    if (message.modes.sms && !providers.sms) {
        context.logger.info(`sms channel not set`)
    }

    if (message.modes.push && !providers.push) {
        context.logger.info(`push channel not set`)
    }

    if (message.modes.chat && !providers.chat) {
        context.logger.info(`chat channel not set`)
    }

    message.meta.messageId = message.id

    for (const recipient of message.to) {
        let user = recipient.user

        if (user.notifications && !user.notifications.enabled) {
            log.info(`${user.code} has disabled the notifications`)
            continue
        }

        let template = message.conversation ? message.conversation.template : message.template
        if (template) {
            if (user.notifications && user.notifications.refusals && user.notifications.refusals.length && user.notifications.refusals.find(r => r === template)) {
                log.info(`${user.code} has unsubscribed the notifications`)
                continue
            }
        }

        log.debug(`sending to ${user.code}`)
        var result = await send(user, message, providers, context)
        message.externalId = result.externalId
        if (result.isDelivered) {
            log.debug(`delivered to ${user.code}`)
            recipient.deliveredOn = new Date()
        }
    }

    if (message.meta.to) {
        for (const recipient of message.meta.to) {
            let user = recipient.user
            var result = await send(user, message, providers, context)
            message.externalId = result.externalId
            if (result.isDelivered) {
                recipient.deliveredOn = new Date()
            }
            message.markModified('meta.to')
        }
    }
    message.status = 'delivered'
    await message.save()
}
