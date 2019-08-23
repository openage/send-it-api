'use strict'

const auth = require('../helpers/auth')

var apiRoutes = require('@open-age/express-api')
var fs = require('fs')
var loggerConfig = require('config').get('logger')
var appRoot = require('app-root-path')

const specs = require('../specs')

var multipart = require('connect-multiparty')
var multipartMiddleware = multipart()

module.exports.configure = function (app) {
    app.get('/', function (req, res) {
        res.render('index', {
            title: 'SEND IT API'
        })
    })

    app.get('/logs', function (req, res) {
        var filePath = appRoot + '/' + loggerConfig.file.filename

        fs.readFile(filePath, function (err, data) {
            res.contentType('application/json')
            res.send(data)
        })
    })

    app.get('/specs', function (req, res) {
        fs.readFile('./public/swagger.html', function (err, data) {
            res.contentType('text/html')
            res.send(data)
        })
    })

    app.get('/specs.json', function (req, res) {
        res.contentType('application/json')
        res.send(specs.get())
    })
    var api = apiRoutes(app)

    api.model('tenants').register([{
        action: 'GET',
        method: 'search',
        filter: auth.requiresSystemAdmin
    }, {
        action: 'GET',
        method: 'get',
        url: '/:id',
        filter: auth.requiresTenantAdmin
    }, {
        action: 'PUT',
        method: 'update',
        url: '/:id',
        filter: auth.requiresTenantAdmin
    }])

    api.model('providers').register([{
        action: 'GET',
        method: 'search',
        filter: auth.requiresAny
    }, {
        action: 'POST',
        method: 'create',
        filter: auth.requiresSystemAdmin
    }, {
        action: 'GET',
        method: 'get',
        url: '/:id',
        filter: auth.requiresAny
    }, {
        action: 'PUT',
        method: 'update',
        url: '/me',
        filter: auth.requiresSystemAdmin
    }])

    api.model('organizations')
        .register([{
            action: 'GET',
            method: 'search',
            filter: auth.requiresTenantAdmin
        }, {
            action: 'GET',
            method: 'get',
            url: '/:id',
            filter: auth.requiresOrganizationAdmin
        }, {
            action: 'PUT',
            method: 'update',
            url: '/:id',
            filter: auth.requiresOrganizationAdmin
        }])

    api.model('channels').register('REST', auth.requiresAdmin)

    api.model('users').register([{
        action: 'GET',
        method: 'get',
        url: '/:id',
        filter: auth.requiresRole
    }, {
        action: 'PUT',
        method: 'update',
        url: '/:id',
        filter: auth.requiresRole
    }, {
        action: 'POST',
        method: 'bulkUpdate',
        url: '/bulk'
    }, {
        action: 'GET',
        method: 'search',
        filter: auth.requiresRole
    }, {
        action: 'POST',
        method: 'mute',
        url: '/:id/mute',
        filter: auth.requiresRole
    }, {
        action: 'POST',
        method: 'unmute',
        url: '/:id/unmute',
        filter: auth.requiresRole
    }, {
        action: 'POST',
        method: 'subscribe',
        url: '/subscriptions/:key',
        filter: auth.requiresRole
    }, {
        action: 'DELETE',
        method: 'unsubscribe',
        url: '/subscriptions/:key',
        filter: auth.requiresRole
    }])

    api.model('diagnostics').register('REST')
    api.model('messages')
        .register('REST', auth.requiresRole)
        .register([{
            action: 'POST',
            method: 'send',
            url: '/send',
            filter: auth.requiresAdmin
        }, {
            action: 'POST',
            method: 'create',
            url: '/byCaptcha',
            filter: auth.requiresCaptcha
        }])

    api.model('conversations').register('REST', auth.requiresRole)

    api.model({
        root: 'emails',
        controller: 'messages'
    })
        .register([{
            action: 'POST',
            method: 'send',
            url: '/send',
            filter: [auth.requiresOrganizationAdmin, function (req, res, next) {
                req.body.type = 'email'
                next()
            }]
        }])

    api.model({
        root: 'sms',
        controller: 'messages'
    })
        .register([{
            action: 'POST',
            method: 'send',
            url: '/send',
            filter: [auth.requiresClient, function (req, res, next) {
                req.body.type = 'sms'
                next()
            }] // TODO only admin should be able to do this
        }])

    api.model({
        root: 'push',
        controller: 'messages'
    })
        .register([{
            action: 'POST',
            method: 'send',
            url: '/send',
            filter: [auth.requiresOrganizationAdmin, function (req, res, next) {
                req.body.type = 'push'
                next()
            }]
        }])

    api.model('jobs')
        .register('REST', auth.requiresRole)
        .register([{
            action: 'POST',
            method: 'run',
            url: '/:code/run',
            filter: auth.requiresRole
        }])

    api.model('docs').register([{
        action: 'POST',
        method: 'createPreview',
        url: '/:code/preview',
        filter: auth.requiresRole
    }, {
        action: 'GET',
        method: 'getByDataId',
        url: '/:code/:dataId.pdf',
        filter: auth.requiresRole
    }, {
        action: 'POST',
        method: 'getByModel',
        url: '/:code.pdf',
        filter: auth.requiresRole
    }])

    api.model('templates')
        .register('REST', auth.requiresAdmin)
        .register([{
            action: 'POST',
            method: 'createWithFile',
            url: '/files',
            filter: [multipartMiddleware, auth.requiresRole]
        }, {
            action: 'POST',
            method: 'cloneWithData',
            url: '/:code/clone',
            filter: [auth.requiresRole]
        }])

    api.model('summaries').register('REST', auth.requiresRole)
}
