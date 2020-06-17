'use strict'
const { validation } = require('../../Helpers/help')
const { createitensSale } = require('../../Helpers/saleHelper')
const database = use('Database')

class AlterSaleController {
  async cancelSale ({ request, response }) {
    const { token, date, VenData, VenNro } = request.all()

    try {
      if (!token || !date || !VenData || !VenNro) return response.status(401).send('Algum dos parametros não foram preenchidos')
      const loggedUser = await validation(response, token, date)
      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
      }

      await database
        .table('REP037')
        .where({
          VenData: VenData,
          VenNro: VenNro,
          VenCod: loggedUser.MpVenCod
        })
        .first()
        .update('VenSitVen', 5)

      return response.status(200).send('Venda Cancelada')

    } catch (e) {
      return response.status(500).send(`Erro desconhecido ${e}`)
    }
  }

  async changeItens ({ request, response }) {
    const Database = await database.beginTransaction()
    const { token, date, VenData, VenNro, VenTot, data } = request.all()
    console.log(data)
    try {
      if (!token || !date || !VenData || !VenNro){
        return response.status(401).send('Algum dos parametros não foram preenchidos')
      } 
      const loggedUser = await validation(response, token, date)

      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
        console.log('will here-2')

      }
      console.log('here -2 ')
      console.log(loggedUser)
      const verifySituationSale = await Database
        .table('REP037')
        .select('VenSitVen')
        .where({
          VenData: VenData,
          VenNro: VenNro,
          VenCod: loggedUser.MpVenCod
        })
        .first()

           
      if (verifySituationSale.VenSitVen !== 0) {
        return response.status(401).send('Não é permitido alterar vendas já encerradas')
        console.log('will here-3', verifySituationSale.VenSitVen)
      }
      

      await Database
        .table('REP037')
        .where({
          VenData: VenData,
          VenNro: VenNro,
          VenCod: loggedUser.MpVenCod
        })
        .update('VenTot', VenTot)

      console.log('aqui')
      await Database
        .table('REP038')
        .where({
          VenData: VenData,
          VenNro: VenNro,
          VenCod: loggedUser.MpVenCod
        })
        .delete()
      console.log('uhul')
      await createitensSale(response, Database, data, date, loggedUser.MpVenCod, VenData, VenNro)
      console.log('uhul-2')
      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
      }

      Database.commit()
      return response.status(200).send('Itens da venda alterado com Sucesso')
    } catch (e) {
      Database.rollback()
      return response.status(500).send(`Erro desconhecido ${e}`)
    }
  }
}

module.exports = AlterSaleController
