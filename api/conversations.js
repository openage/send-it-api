const service = require('../services/conversations')
const mapper = require('../mappers/conversation')

const api = require('./api-base')('conversations', 'conversation')

api.get = async (req) => {
    let entity
    if (req.params.id === 'entity') {
        entity = await service.getEntityConversation({
            id: req.query['entity-id'],
            type: req.query['entity-type'],
            name: req.query['entity-name']
        }, req.context)
    } else if (req.params.id === 'direct') {
        entity = await service.getDirectConversation(req.query['user-ids'], req.context)
    } else {
        entity = await service.get(req.params.id, req.context)
    }
    return mapper.toModel(entity, req.context)
}

api.addParticant = async (req) => {
    let entity = await service.addParticipant(req.params.id, req.body, req.context)
    return mapper.toModel(entity, req.context)
}

api.removeParticipant = async (req) => {
    let entity = await service.removeParticipant(req.params.id, req.body, req.context)
    return mapper.toModel(entity, req.context)
}

module.exports = api
