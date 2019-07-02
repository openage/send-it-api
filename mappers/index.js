'use strict'
var fs = require('fs')
var join = require('path').join
const paramCase = require('param-case')
var _ = require('underscore')

var mappers = {}

var init = function () {
    fs.readdirSync(__dirname).forEach(function (file) {
        if (file.indexOf('.js') !== -1 && file.indexOf('index.js') < 0) {
            var mapper = require('./' + file)

            var name = file.substring(0, file.indexOf('.js'))

            // use toModel as toSummary if one is not defined
            if (!mapper.toSummary) {
                mapper.toSummary = mapper.toModel
            }

            if (!mapper.toModels) {
                mapper.toModels = function (entities, context) {
                    var models = []

                    entities.forEach((entity) => {
                        models.push(mapper.toModel(entity, context))
                    })

                    return models
                }
            }

            mappers[paramCase(name)] = mapper
        }
    })
}

init()

module.exports = mappers
