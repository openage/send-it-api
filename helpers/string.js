'use strict'
const validator = require('validator')
String.prototype.toObjectId = function () {
    var ObjectId = (require('mongoose').Types.ObjectId)
    return new ObjectId(this.toString())
}

String.prototype.isObjectId = function () {
    return validator.isMongoId(this)
}

global.toObjectId = id => require('mongoose').Types.ObjectId(id)
