'use strict'

const {returnPages, validation, showPages, message} = require('../../Helpers/help')
const Database = use('Database')
const Xmlb = use('App/Models/Xmlb')

class ProductGroupController {

  async productsDescription({response, request}) {
    const {token, date, page, search} = request.all()

    try {

      await validation(response, token, date)
      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
      }

      if (!page || !search) {
        return response.status(401).send('Valores de Page e Search não estão no formato válido')
      }

      const showResult = showPages(page)

      const totalRows = await Database.raw('SELECT count(*) as total FROM P0227 where ProGrupoDe >= ?', [search])

      const pagination = await Database.raw('SELECT ProGrupo, ProGrupoDe, ProPreco, Procod, ProGruN FROM (SELECT Row_Number() OVER (ORDER BY a.ProGrupoDe) as Contador, a.*, produto.Procod FROM P0227 as a inner join P0007 as produto on a.ProGrupo = produto.ProGrupo where a.ProGrupoDe like ? AND produto.Procod IN ( SELECT TOP 1 Procod from P0007 where a.ProGrupo = ProGrupo )) As RowResults WHERE Contador Between ? AND ? ORDER BY Contador', [search + '%', showResult.from, showResult.into])

      return {
        totalProducts: totalRows[0].total,
        totalPages: returnPages(totalRows[0].total, showResult.into - showResult.from),
        products: [...pagination]
      }
    } catch (e) {
      return response.status(500).send(`Ação não conhecida ${e}`)
    }
  }

  async productsId({response, request}) {
    const {token, date, id} = request.all()
    
    try {

      await validation(response, token, date)
      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
      }

      if (!id || typeof id !== 'number') return response.status(401).send(`Valor de ID é ${message(id)} e não é suportado`)


      
      const queryID = await Database
        .select('grupo.ProGrupo', 'grupo.ProGrupoDe', 'grupo.ProPreco', 'grupo.ProGruN', 'produto.Procod')
        .table('P0227 as grupo')
        .innerJoin('P0007 as produto', 'grupo.ProGrupo', 'produto.ProGrupo')
        .where('grupo.ProGrupo', id)
        .first()

   
        if (!queryID) {
        return response.status(400).send('Código de barras não encontrado')
      }

      const {ProGrupo, ProGrupoDe, Procod} = queryID

      console.log(queryID)

      return {
        ...queryID,
        ProGrupo: ProGrupo.trim(),
        ProGrupoDe: ProGrupoDe.trim(),
        Procod: Procod.trim()
      }

    } catch (e) {
      return response.status(500).send(`Ação não conhecida ${e}`)
    }
  }

  async eanId({response, request}) {
    const {token, date, id} = request.all()
    if (!id || typeof id !== 'number') return response.status(400).send(`Valor de ID é ${message(id)} e não é suportado`)
    try {
      return await validation(response, token, date, async () => {
        
          const queryId = await Database
          .select('grupo.ProGrupoDe', 'grupo.ProGrupo', 'grupo.ProGruN', 'produto.Procod', 'grupo.ProPreco')
          .table('XMLB')
          .innerJoin('P0007 as produto', 'XMLB.XmlProcod', 'produto.Procod')
          .innerJoin('P0227 as grupo', 'grupo.ProGrupo', 'produto.ProGrupo')
          .where('XMLB.XMLEanForn', id)
        
        console.log(queryId)

        if (!queryId) {
          return response.status(201).send('Produto não encontrado')
        }

        const {ProGrupoDe, ProGrupo, Procod} = queryId[0]

        return {
          ...queryId[0],
          ProGrupo: ProGrupo.trim(),
          ProGrupoDe: ProGrupoDe.trim(),
          Procod: Procod.trim()
        }
      })
    } catch (e) {
      return response.status(400).send(`Código de barras não cadastrado!`)
      // return response.status(500).send(`Ação não conhecida ${e}`)
    }
  }

}

module.exports = ProductGroupController
