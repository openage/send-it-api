'use strict'

const jobs = require('../../../services/jobs')
exports.process = async (job, context) => {
    await jobs.run(job, context)
}
