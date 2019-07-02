'use strict'
var db = require('../models')
var async = require('async')

exports.canSend = function (req, callback) {
    var model = req.body

    if (!model.template) {
        return callback('template is required')
    }

    if (!model.to) {
        return callback('to is required')
    }

    callback(null)
}

exports.canSearch = (req, callback) => {
    if (req.query.status && req.query.status !== 'queued' && req.query.status !== 'delivered' && req.query.status !== 'viewed' && req.query.status !== 'archived') {
        return callback('invalid status')
    }

    callback(null)
}
