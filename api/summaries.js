'use strict'

const summaries = require('../services/summaries')
const mapper = require('../mappers/summary')

exports.get = async (req) => {
    const log = req.context.logger.start('mySummary')

    const id = req.params.id === 'my' ? req.context.user.id : req.params.id

    const mySummary = await summaries.get(id, req.context)

    return mapper.toModel(mySummary, req.context)
}
