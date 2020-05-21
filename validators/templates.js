'use strict'
var db = require('../models')
var async = require('async')

exports.canCreate = async (req) => {
    var model = req.body

    if (!model.code) {
        throw new Error('code is required')
    }

}
