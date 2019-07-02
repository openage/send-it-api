'use strict'

const logger = require('@open-age/logger')('JOB day-start')
const cron = require('cron').CronJob
const offline = require('@open-age/offline-processor')
const db = require('../models')

const contextBuilder = require('../helpers/context-builder')

const start = async () => {
    let jobs = await db.job.find({
        status: 'active',
        'periodicity.type': 'daily'
    }).populate('template tenant organization').sort({ timestamp: 1 })

    for (const job of jobs) {
        let user = job.tenant.owner
        if (job.organization) {
            user = job.organization.owner
        }

        let context = await contextBuilder.create({
            organization: job.organization,
            tenant: job.tenant,
            user: user
        }, logger)
        await offline.queue('job', 'run', job, context)
    }
}

exports.schedule = (orgCodes) => {
    let log = logger.start('schedule')
    new cron({
        cronTime: `10 10 00 * * *`,
        onTick: () => {
            start(orgCodes)
        },
        start: true
    })
    log.info(`scheduled: day start for all the organizations`)
    log.end()
}

exports.run = async (orgCodes, date) => {
    await start(orgCodes, date)
}
