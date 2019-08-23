const api = require('./api-base')('templates', 'template')

const service = require('../services/templates')
const mapper = require('../mappers/template')


api.createWithFile = async (req, res) => {
    if (!service.createWithFile) {
        throw new Error(`METHOD_NOT_SUPPORTED`)
    }

    let template = await service.createWithFile(req.files.file, req.query, req.context)

    return mapper.toModel(template)
}

api.cloneWithData = async (req, res) => {
    if (!service.cloneWithData) {
        throw new Error(`METHOD_NOT_SUPPORTED`)
    }

    let template = await service.cloneWithData(req.params.code, req.body, req.context)

    return mapper.toModel(template)
}

module.exports = api
