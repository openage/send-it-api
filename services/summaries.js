const messages = require('../services/messages')

exports.get = async (id, context) => {
    const log = context.logger.start('get')

    let summary = {}

    let messagesQuery = {
        to: id,
        isHidden: false
    }

    let unreadQuery = {
        to: id,
        isHidden: false,
        viewedOn: { $exists: true }
    }

    let actionQuery = {
        to: id,
        isHidden: false,
        'meta.actions.1': { $exists: true }
    }

    summary.messages = await messages.limit(10, messagesQuery, context)
    summary.total = await messages.count(messagesQuery, context)
    summary.unread = await messages.count(unreadQuery, context)
    summary.actions = await messages.count(actionQuery, context)

    return summary
}
