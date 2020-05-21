'use strict'

const messages = require('../../../services/messages')

exports.process = async (data, context) =>{
    messages.process(data.id, context)
}
