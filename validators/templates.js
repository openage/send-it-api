'use strict'
var db = require('../models')
var async = require('async')

exports.canCreate = function (req, callback) {
    var model = req.body

    if (!model.code) {
        return callback('code is required')
    }

    db.template.findOne({
        code: model.code,
        status: 'active',
        tenant: req.context.tenant.id
    }).exec(function (err, template) {
        if (err) {
            return callback(err)
        }
        if (template) {
            return callback('code already exists')
        }
        callback(null)
    })
}
