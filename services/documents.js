'use strict'

const pdf = require('html-pdf')
const dataSources = require('./data-sources')
const formatter = require('../helpers/template').formatter
const templateService = require('./templates')

const builder = (template, context) => {
    const subjectFormatter = formatter(template.subject || '')
    const bodyFormatter = formatter(template.body || '')
    return {
        inject: (data) => {
            return {
                name: subjectFormatter.inject(data),
                content: bodyFormatter.inject(data)
            }
        },
        toPdf: (data) => {
            let content = bodyFormatter.inject(data)
            return pdf.create(content, template.config)
        }
    }
}

exports.getPdfByDataId = async (dataId, code, context) => {
    let template = await templateService.get(code, context)

    let model = {
        dataSource: template.dataSource || {}
    }

    model.dataSource.params = dataSource.params || []
    model.dataSource.params.push({
        key: 'dataId',
        value: dataId
    })

    let items = await dataSources.fetch(model, context)

    return new Promise((resolve, reject) => {
        builder(template, context).toPdf(items[0]).toBuffer((err, buffer) => {
            if (err) {
                return reject(err)
            }
            resolve(buffer)
        })
    })
}

exports.getPdfByModel = async (model, code, context) => {
    let template = await templateService.get(code, context)

    let items = await dataSources.fetch(model, context)

    return new Promise((resolve, reject) => {
        builder(template, context).toPdf(items[0]).toBuffer((err, buffer) => {
            if (err) {
                return reject(err)
            }
            resolve(buffer)
        })
    })
}

exports.getDocByModel = async (model, code, context) => {
    let template = await templateService.get(code, context)

    let items = await dataSources.fetch(model, context)
    return builder(template, context).inject(items[0])
}

exports.getDocByTemplate = async (data, template, context) => {
    return builder(template, context).inject(data)
}
