module.exports = [{
    name: 'summaryRes',
    properties: {
        total: {
            type: 'number'
        },
        unread: {
            type: 'number'
        },
        actions: {
            type: 'string'
        },
        messages: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string'
                    },
                    code: {
                        'type': 'string'
                    },
                    name: {
                        'type': 'string'
                    },
                    title: {
                        'type': 'string'
                    },
                    body: {
                        'type': 'string'
                    },
                    priority: {
                        'type': 'string'
                    },
                    category: {
                        'type': 'string'
                    },
                    deliveredOn: {
                        'type': 'string'
                    },
                    viewedOn: {
                        'type': 'string'
                    },
                    archivedOn: {
                        'type': 'string'
                    },
                    processedOn: {
                        'type': 'string'
                    },
                    status: {
                        'type': 'string'
                    },
                    meta: {
                        'type': 'object'
                    }
                }

            }
        }
    }
}]
