const service = require('../services/jobs')
const mapper = require('../mappers/job')
const offline = require('@open-age/offline-processor')

const api = require('./api-base')('jobs', 'job')

api.run = async (req) => {
    const job = await service.get(req.params.code, req.context)
    await offline.queue('job', 'run', job, req.context)
    return mapper.toModel(job, req.context)
}

module.exports = api
