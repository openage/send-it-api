'use strict'
const validator = require('validator')
// eslint-disable-next-line no-extend-native
String.prototype.toObjectId = function () {
    let ObjectId = (require('mongoose').Types.ObjectId)
    return new ObjectId(this.toString())
}

// eslint-disable-next-line no-extend-native
String.prototype.isObjectId = function () {
    return validator.isMongoId(this)
}

String.prototype.isEmail = function () {
    return validator.isEmail(this)
}

String.prototype.isPhone = function () {
    let code = this

    return code.match(/^\d{10}$/) ||
        code.match(/^(\+\d{1,3}[- ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/) ||
        code.match(/^(\+\d{1,3}[- ]?)?\(?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/)
}

String.prototype.isMobile = function () {
    let code = this

    return code.match(/^\d{10}$/) ||
        code.match(/^(\+\d{1,3}[- ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/) ||
        code.match(/^(\+\d{1,3}[- ]?)?\(?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/)
}

String.prototype.isUUID = function () {
    return validator.isUUID(this)
}

// eslint-disable-next-line no-extend-native
String.prototype.inject = function (data) {
    let template = this

    function getValue (obj, is, value) {
        if (typeof is === 'string') {
            is = is.split('.')
        }
        if (is.length === 1 && value !== undefined) {
            // eslint-disable-next-line no-return-assign
            return obj[is[0]] = value
        } else if (is.length === 0) {
            return obj
        } else {
            let prop = is.shift()
            // Forge a path of nested objects if there is a value to set
            if (value !== undefined && obj[prop] === undefined) { obj[prop] = {} }
            return getValue(obj[prop], is, value)
        }
    }

    return template.replace(/\$\{(.+?)\}/g, (match, p1) => getValue(data, p1))
}
global.toObjectId = id => require('mongoose').Types.ObjectId(id)
