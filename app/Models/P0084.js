'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class P0084 extends Model {
    static get table () {
        return 'P0084'
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

    static get primaryKey () {
        return 'usermkt'
    }
}

module.exports = P0084
