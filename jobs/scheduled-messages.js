'use strict'

const logger = require('@open-age/logger')('JOB scheduled-messages')
const cron = require('cron').CronJob
const offline = require('@open-age/offline-processor')
const db = require('../models')

const contextBuilder = require('../helpers/context-builder')

const cronParser = require('cron-parser');

const dates = require('../helpers/dates')

let initialized = false


const run = async (job, context) => {
    let log = context.logger.start(`run`)

    job.next.status = 'in-progress'
    await job.save()

    let error = null
    try {
        await offline.queue('job', 'run', job, context)
    } catch (err) {
        err = error
        log.error(error)
    }

    job.last = {
        time: new Date(),
        error: error,
        status: error ? 'error' : 'done'
    }
    job.next = {}
    await job.save()

    log.end()
}


const start = async (orgCodes) => {
    let jobs = await db.job.find({
        status: 'active',
        'periodicity.expression': { $exists: true }
    }).populate('template tenant organization user')

    let now = new Date();

    for (const job of jobs) {

        if (initialized && job.next && job.next.time && job.next.time > now) {
            continue
        }

        let context = await contextBuilder.create({
            organization: job.organization,
            tenant: job.tenant,
            user: job.user
        }, logger.start(`id:${job.id}`))

        const nextTime = cronParser.parseExpression(job.periodicity.expression).next().toDate()

        if (nextTime < now) {
            context.logger.info(`cannot schedule; deactivating it`)
            job.status = 'inactive'
            await job.save()
            continue
        }

        job.next = job.next || {}
        job.next.time = nextTime
        job.next.status = 'scheduled'
        await job.save()

        const cronTime = dates.date(nextTime).toCron()

        context.logger.info(`scheduled for ${cronTime}`)

        new cron({
            cronTime: cronTime,
            onTick: () => {
                run(job, context)
            },
            start: true
        })
    }
}

exports.schedule = (orgCodes) => {
    new cron({
        cronTime: `* 0/15 * * * *`,
        onTick: () => {
            let log = logger.start('schedule')
            start(orgCodes).then(() => {
                log.end('done')
                initialized = true
            })
        },
        start: true
    })
}

exports.run = async (orgCodes, date) => {
    await start(orgCodes, date)
}
