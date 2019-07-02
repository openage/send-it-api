'use strict'
const logger = require('@open-age/logger')('channels.slack')
var defaultConfig = require('config').get('providers.slack')
var Slack = require('slack-node')

let getConfig = (config) => {
    if (!config) {
        return defaultConfig
    }

    return {
        webhookUrl: config.webhookUrl || defaultConfig.webhookUrl,
        channel: config.channel || defaultConfig.channel,
        username: config.username || defaultConfig.username,
        icon_emoji: config.icon_emoji || defaultConfig.icon_emoji,
        token: config.token,
        domain: config.domain
    }
}

const send = (message, to, config) => {
    var log = logger.start('sending slack message')

    let configuration = getConfig(config)
    var slack = new Slack(configuration.token, configuration.token)
    slack.setWebhook(configuration.webhookUrl)

    return new Promise((resolve, reject) => {
        slack.webhook({
            channel: configuration.channel,
            username: configuration.username,
            icon_emoji: config.icon_emoji,
            text: message.message
        }, function (err, response) {
            if (err) {
                logger.error('err in slack provider')
                logger.error(err)
            }
            return resolve(null)
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
