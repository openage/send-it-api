const jobService = require('../../services/jobs')
const taskService = require('../../services/tasks')

exports.process = async (task, context) => {
    context.task = await taskService.update(task.id, { status: 'in-progress' })
    try {
        switch (task.entity.type) {
        case 'job':
            let job = await exports.get(id, context)
            await jobService.run(job, context)
            await taskService.update(task.id, { status: 'done' })
            break

        default:
            await taskService.update(task.id, {
                status: 'invalid',
                error: {
                    message: `entity.type: '${task.entity.type}' is not implemented`
                }
            })
            break
        }
    } catch (err) {
        task.status = 'error'
        task.error = {
            message: err.message || err,
            stack: err.stack
        }
        await taskService.update(task.id, {
            status: 'error',
            error: {
                message: err.message || err,
                stack: err.stack
            }
        })
    }
}
