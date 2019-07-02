module.exports = [{
    'name': 'templateRes',
    'properties': {
        'code': {
            'type': 'string'
        },
        'subject': {
            'type': 'string'
        },
        'body': {
            'type': 'string'
        },
        'logo': {
            'type': 'string'
        },
        'dp': {
            'type': 'string'
        },
        'category': {
            'type': 'string'
        },
        'isHidden': {
            'type': 'boolean'
        },
        'attachment': {
            'type': 'object',
            'properties': {
                'type': 'object',
                'code': {
                    'type': 'string'
                },
                'id': {
                    'type': 'string'
                }
            }
        },
        'action': {
            'type': 'array',
            'items': {
                'type': 'object',
                'properties': {
                    'label': {
                        'type': 'string'
                    },
                    'type': {
                        'type': 'string'
                    },
                    'operation': {
                        'type': 'string'
                    },
                    'await': {
                        'type': 'boolean'
                    },
                    'data': {
                        'type': 'object',
                        'properties': {
                            'body': {
                                'type': 'string'
                            },
                            'url': {
                                'type': 'string'
                            },
                            'headers': {
                                'type': 'object'
                            }
                        }
                    }
                }

            }
        },
        'config': {
            'type': 'object',
            'properties': {
                'type': 'object',
                'orientation': {
                    'type': 'string'
                },
                'width': {
                    'type': 'string'
                },
                'height': {
                    'type': 'string'
                },
                'border': {
                    'type': 'object',
                    'properties': {
                        'type': 'object',
                        'left': {
                            'type': 'string'
                        },
                        'right': {
                            'type': 'string'
                        },
                        'top': {
                            'type': 'string'
                        },
                        'bottom': {
                            'type': 'string'
                        }
                    }
                }
            }
        }
    }
}]
