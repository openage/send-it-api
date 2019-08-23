const channels = require('../../../services/channels')
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
    if (device && device.id) {
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

exports.process = async (message, context) => {
    let log = context.logger.start(`process message: ${message.id}`)
    message.meta.messageId = message.id
    let emailChannel = message.modes.email ? await channels.getByMode('email', context) : null
    let smsChannel = message.modes.sms ? await channels.getByMode('sms', context) : null
    let chatChannel = message.modes.chat ? await channels.getByMode('chat', context) : null
    let pushChannel = message.modes.push ? await channels.getByMode('push', context) : null

    let emailProvider = emailChannel ? require('../../../providers/' + emailChannel.provider.code).config(emailChannel.config) : null
    let smsProvider = smsChannel ? require('../../../providers/' + smsChannel.provider.code).config(smsChannel.config) : null
    let pushProvider = pushChannel ? require('../../../providers/' + pushChannel.provider.code).config(pushChannel.config) : null
    let chatProvider = chatChannel ? require('../../../providers/' + chatChannel.provider.code).config(chatChannel.config) : null

    for (const recipient of message.to) {
        let user = recipient.user

        if (!user.notifications.enabled) {
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

        let isDelivered = false

        if (pushProvider) {
            for (let device of user.devices) {
                if (isDeviceValid(device)) {
                    if (await pushProvider.send(message, device)) {
                        isDelivered = true
                        continue
                    }
                }
            }
        }

        if (!isDelivered && emailProvider && isEmailValid(user.email)) {
            isDelivered = await emailProvider.send(message, user)
        }

        if (!isDelivered && smsProvider && isMobileValid(user.phone)) {
            isDelivered = await smsProvider.send(message, user)
        }

        if (!isDelivered && chatProvider && isChatValid(user.chatId)) {
            isDelivered = await smsProvider.send(message, user)
        }

        if (isDelivered) {
            log.debug(`delivered to ${user.code}`)
            recipient.deliveredOn = new Date()
        }
    }
    message.status = 'delivered'
    await message.save()
}
