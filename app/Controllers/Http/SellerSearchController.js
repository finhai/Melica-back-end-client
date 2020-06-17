'use strict'
const { returnPages, validation, showPages } = require('../../Helpers/help')
const Database = use('Database')

class SellerSearchController {
  async sellerFinder ({ request, response }) {
    const { token, date, page, name, code } = request.all()

    try {
      if (!token || !date || !page) return response.status(401).send('Algum dos parametros não foram preenchidos')
      await validation(response, token, date)
      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
      }
      const showResult = showPages(page)

      if (!name && !code) {

        const totalRows = await Database.raw('SELECT count(*) as total FROM P0084')

        const pagination = await Database.raw('SELECT usermkt, MpVenCod, MpFilPad\n' +
                    'FROM (SELECT Row_Number() OVER (ORDER BY MpVenCod DESC) as Contador, *\n' +
                    '      from P0084) As RowResults\n' +
                    'WHERE Contador Between ? AND ?\n' +
                    'ORDER BY MpVenCod DESC;', [showResult.from, showResult.into])

        return {
          totalUsers: totalRows[0].total,
          totalPages: returnPages(totalRows[0].total, showResult.into - showResult.from),
          Users: [...pagination]
        }
      }
      if (name && !code) {

        const totalRows = await Database.raw('SELECT count(*) as total FROM P0084 where usermkt = ?', [name])

        const pagination = await Database.raw('SELECT usermkt, MpVenCod, MpFilPad\n' +
                    'FROM (SELECT Row_Number() OVER (ORDER BY MpVenCod DESC) as Contador, *\n' +
                    '      from P0084' +
                    '   where usermkt = ?) As RowResults\n' +
                    'WHERE Contador Between ? AND ?\n' +
                    'ORDER BY MpVenCod DESC;', [name, showResult.from, showResult.into])

        return {
          totalUsers: totalRows[0].total,
          totalPages: returnPages(totalRows[0].total, showResult.into - showResult.from),
          Users: [...pagination]
        }
      }
      if (!name && code) {

        const totalRows = await Database.raw('SELECT count(*) as total FROM P0084 where MpVenCod = ?', [code])

        const pagination = await Database.raw('SELECT usermkt, MpVenCod, MpFilPad\n' +
                    'FROM (SELECT Row_Number() OVER (ORDER BY MpVenCod DESC) as Contador, *\n' +
                    '      from P0084' +
                    '   where MpVenCod = ?) As RowResults\n' +
                    'WHERE Contador Between ? AND ?\n' +
                    'ORDER BY MpVenCod DESC;', [code, showResult.from, showResult.into])

        return {
          totalUsers: totalRows[0].total,
          totalPages: returnPages(totalRows[0].total, showResult.into - showResult.from),
          Users: [...pagination]
        }
      }
      if (name && code) {

        const totalRows = await Database.raw('SELECT count(*) as total FROM P0084 where MpVenCod = ? and usermkt = ?', [code, name])

        const pagination = await Database.raw('SELECT usermkt, MpVenCod, MpFilPad\n' +
                    'FROM (SELECT Row_Number() OVER (ORDER BY MpVenCod DESC) as Contador, *\n' +
                    '      from P0084' +
                    '   where MpVenCod = ?' +
                    '   and usermkt = ?) As RowResults\n' +
                    'WHERE Contador Between ? AND ?\n' +
                    'ORDER BY MpVenCod DESC;', [code, name, showResult.from, showResult.into])

        return {
          totalUsers: totalRows[0].total,
          totalPages: returnPages(totalRows[0].total, showResult.into - showResult.from),
          Users: [...pagination]
        }
      } else {
        return response.status(404).send('A pesquisa não atende aos parâmetros da busca')
      }
    } catch (e) {
      return response.status(500).send(`Erro desconhecido ${e}`)
    }
  }

}

module.exports = SellerSearchController
