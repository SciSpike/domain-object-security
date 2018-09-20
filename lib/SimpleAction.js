'use strict'

const { Enum } = require('enumify')

class SimpleAction extends Enum {}

SimpleAction.initEnum(['CREATE', 'REFERENCE', 'READ', 'UPDATE', 'DELETE', 'SECURE'])

module.exports = SimpleAction
