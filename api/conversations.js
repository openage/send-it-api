const service = require('../services/conversations')
const mapper = require('../mappers/conversation')

const api = require('./api-base')('conversations', 'conversation')

const requestHelper = require('../helpers/paging')

const getConversation = (req) => {
    let conversation = {}
    const query = requestHelper.query(req)

    switch (req.params.id) {
        case 'entity':
            conversation.entity = query.entity
            break
        case 'direct':
            conversation.user = query.user
            break
        default:
            conversation.id = req.params.id
            break
    }

    return conversation
}

api.get = async (req) => {
    let conversation = getConversation(req)
    let entity = await service.get(conversation, req.context)
    return mapper.toModel(entity, req.context)
}


api.update = async (req) => {
    let conversation = getConversation(req)
    entity = await service.update(conversation, req.body, req.context)
    return mapper.toModel(entity, req.context)
}


api.addParticipant = async (req) => {
    let conversation = getConversation(req)
    let entity = await service.addParticipant(conversation, req.body, req.context)
    return mapper.toModel(entity, req.context)
}

api.removeParticipant = async (req) => {
    let conversation = getConversation(req)
    let entity = await service.removeParticipant(conversation, {
        role: {
            id: req.params.roleId
        }
    }, req.context)
    return mapper.toModel(entity, req.context)
}

api.getDirectConversationByRoleId = async (req) => {
    let entity = await service.get({
        user: {
            role: {
                id: req.params.id
            }
        }
    }, req.context)
    return mapper.toModel(entity, req.context)
}

module.exports = api
