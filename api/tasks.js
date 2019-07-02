const service = require('../services/tasks')
const mapper = require('../mappers/task')

const api = require('./api-base')('tasks', 'task')

api.run = async (req) => {
    const task = await service.get(req.params.id, req.context)
    task.status = 'queued'
    await task.save()
    await offline.queue('task', 'run', task, req.context)
    return mapper.toModel(task, req.context)
}

module.exports = api
