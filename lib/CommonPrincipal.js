'use strict'

const { Enum } = require('enumify')

class CommonPrincipal extends Enum {}

CommonPrincipal.initEnum(['ALL'])

module.exports = CommonPrincipal
