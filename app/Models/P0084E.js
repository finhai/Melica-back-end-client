'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class P0084E extends Model {
    static get table () {
        return 'P0084E'
    }

    static get incrementing () {
        return false
    }

    static get createdAtColumn () {
        return null
    }

    static get updatedAtColumn () {
        return null
    }
}

module.exports = P0084E
