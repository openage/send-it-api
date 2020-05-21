'use strict'

var HttpClient = require('node-rest-client').Client
var formatter = require('../helpers/template').formatter

const extractContext = (context) => {
    let current = {}

    if (context.tenant) {
        current.tenant = {
            id: context.tenant.id,
            code: context.tenant.code,
            name: context.tenant.name,
            logo: context.tenant.logo
        }
    }

    if (context.organization) {
        current.organization = {
            id: context.organization.id,
            code: context.organization.code,
            shortName: context.organization.shortName,
            name: context.organization.name,
            logo: context.organization.logo,
            address: {}
        }

        if (context.organization.address) {
            current.organization.address = {
                line1: current.organization.address.line1,
                line2: current.organization.address.line2,
                district: current.organization.address.district,
                city: current.organization.address.city,
                state: current.organization.address.state,
                pinCode: current.organization.address.pinCode,
                country: current.organization.address.country
            }
        }
    }

    if (context.user) {
        current.user = {
            id: context.user.id,
            code: context.user.code,
            profile: {
                firstName: context.user.firstName,
                lastName: context.user.lastName
            },
            role: {
                id: context.user.role.id,
                key: context.user.role.key
            }
        }
    }

    return current
}

exports.fetch = async (data, context) => {
    let current = extractContext(context)

    if (!data.dataSource) {
        return convertToArray(data, current)
    }
    const dataSource = data.dataSource

    var params = {
        context: current
    }

    for (const param of dataSource.params) {
        params[param.key] = param.value
    }

    let connectionString = formatter(dataSource.connectionString).inject(params)

    let meta = formatter(JSON.stringify(dataSource.meta || {})).inject(params)
    meta = JSON.parse(meta)

    switch (dataSource.type) {
        case 'http':
            data = await getFromUrl({
                url: connectionString,
                headers: meta,
                field: dataSource.field
            }, 10, context)
            break
        case 'file':
            data = await getFromFile({
                path: connectionString
            }, context)
            break

        default:
            throw new Error(`data source '${dataSource.type}' not supported`)
    }
    return convertToArray(data, current)
}

const getFromFile = (source, context) => {
    context.logger.info('getting data from file', source)
    return new Promise(function (resolve, reject) {
        require('jsonfile').readFile(source.path, function (err, fileData) {
            if (err) {
                reject(err)
            } else {
                data = source.field ? fileData[source.field] : (fileData.data || fileData.items || fileData)
                resolve(fileData)
            }
        })
    })
}

const getFromUrl = (source, attempts, context) => {
    context.logger.info('getting data from url', source)

    let log = context.logger.start('getData attempt:' + attempts)

    let httpClient = new HttpClient()

    return new Promise(function (resolve, reject) {
        httpClient.get(source.url, { headers: source.headers }, function (serverData) {
            if (serverData.IsSuccess || serverData.isSuccess) {
                let data = source.field ? serverData[source.field] : serverData.data || serverData.items
                resolve(data)
            } else {
                return reject(serverData.error || 'server did not return isSuccess')
            }
        }).on('error', function (err) {
            log.error(err)
            if (attempts === 0) {
                return reject('could not get data from -' + source.url)
            }
            return getFromUrl(source, --attempts, context)
        })
    })
}

var convertToArray = function (data, current) {
    var items = []
    if (Array.isArray(data)) {
        items = data.map(i => {
            i.context = current
            return i
        })
    } else {
        data.context = current
        items.push(data)
    }

    return items
}
