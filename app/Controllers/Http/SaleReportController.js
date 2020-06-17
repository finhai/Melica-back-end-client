'use strict'
const { returnPages, validation, showPages } = require('../../Helpers/help')
const Database = use('Database')

class SaleReportController {
  async saleReport ({ request, response }) {
    console.log('here')
    let { token, date, page, onDate, onlyOpen } = request.all()

    try {
      console.log('will here-1')
      if (!token || !date || !page) return response.status(401).send('Algum dos parametros não foram preenchidos')
      console.log('will here-2')
      const loggedUser = await validation(response, token, date)
      console.log('will here-3')
      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
        console.log('will here-4')

      }
      const showResult = showPages(page)

      if (onDate) {
        onDate = onDate.substring(0, 10) + 'T00:00:00.000Z'
        const totalRows = await Database.raw('SELECT count(*) as total FROM REP037 where VenCod = ? AND VenData = ?', [loggedUser.MpVenCod, onDate])

        if (onlyOpen === true) {
          const pagination = await Database.raw('SELECT VenData, VenNro, VenCod, VenTot, VenHora, VenSitVen\n' +
                        'FROM (SELECT Row_Number() OVER (ORDER BY VenData DESC) as Contador, *\n' +
                        '      from REP037\n' +
                        '      where VenData = ?  and VenSitVen = 0) As RowResults\n' +
                        'WHERE Contador Between ? AND ?\n' +
                        'ORDER BY VenData DESC;', [onDate, showResult.from, showResult.into])
          return {
            totalProducts: totalRows[0].total,
            totalPages: returnPages(totalRows[0].total, showResult.into - showResult.from),
            order: [...pagination]
          }
        }
        const pagination = await Database.raw('SELECT VenData, VenNro, VenCod, VenTot, VenHora, VenSitVen\n' +
                    'FROM (SELECT Row_Number() OVER (ORDER BY VenData DESC) as Contador, *\n' +
                    '      from REP037\n' +
                    '      where VenCod = ? AND VenData = ?) As RowResults\n' +
                    'WHERE Contador Between ? AND ?\n' +
                    'ORDER BY VenData DESC;', [loggedUser.MpVenCod, onDate, showResult.from, showResult.into])

        return {
          totalProducts: totalRows[0].total,
          totalPages: returnPages(totalRows[0].total, showResult.into - showResult.from),
          order: [...pagination]
        }
      }

      const totalRows = await Database.raw('SELECT count(*) as total FROM REP037 where VenCod = ?', [loggedUser.MpVenCod])

      const pagination = await Database.raw('SELECT VenData, VenNro, VenCod, VenTot, VenHora, VenSitVen\n' +
                'FROM (SELECT Row_Number() OVER (ORDER BY VenData DESC) as Contador, *\n' +
                '      from REP037\n' +
                '      where VenCod = ?) As RowResults\n' +
                'WHERE Contador Between ? AND ?\n' +
                'ORDER BY VenData DESC;', [loggedUser.MpVenCod, showResult.from, showResult.into])

      return {
        totalProducts: totalRows[0].total,
        totalPages: returnPages(totalRows[0].total, showResult.into - showResult.from),
        order: [...pagination]
      }
    } catch (e) {
      return response.status(500).send(`Erro desconhecido ${e}`)
    }
  }

  async storeSale ({ request, response }) {
    const { token, date, page, onDate, VenNro } = request.all()

    try {
      if (!token || !date || !page || !onDate || !VenNro) return response.status(401).send('Algum dos parametros não foram preenchidos')
      const loggedUser = await validation(response, token, date)
      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
      }
      const showResult = showPages(page)

      const totalRows = await Database.raw('SELECT count(*) as total FROM REP038 where VenNro = ? AND VenData = ? AND VenCod = ?', [VenNro, onDate, loggedUser.MpVenCod])

      const pagination = await Database.raw('SELECT VenData, VenNro, VenCod, VenQtde, VenValUni, VenGruDes, ProGrupo, VenProcod, VenCFOP\n' +
        'FROM (SELECT Row_Number() OVER (ORDER BY VenData DESC) as Contador, *\n' +
        '      from REP038\n' +
        '      where VenCod = ? AND VenData = ? AND VenNro = ?) AS RowResults\n' +
        'WHERE Contador Between ? AND ?\n' +
        'ORDER BY VenData DESC', [loggedUser.MpVenCod, onDate, VenNro, showResult.from, showResult.into])

      return {
        totalProducts: totalRows[0].total,
        totalPages: returnPages(totalRows[0].total, showResult.into - showResult.from),
        products: [...pagination]
      }
    } catch (e) {
      return response.status(500).send(`Erro desconhecido ${e}`)
    }
  }
}

module.exports = SaleReportController
