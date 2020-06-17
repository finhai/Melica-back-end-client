'use strict'

const {validation} = require('../../Helpers/help')
const {verifyFirstOrCreate} = require('../../Helpers/saleHelper')
const database = use('Database')

class SaleController {
  async storeSale({request, response}) {
    const Database = await database.beginTransaction()
    const {token, date, VendCod, name, totalAmount, data} = request.all()

        
    try {
      console.log('will here-1')

      await validation(response, token, date)
      console.log('will here-2')

      if (response._lazyBody.content && response.response.statusCode) {
        Database.rollback()
        return response.status(response.response.statusCode).send(response._lazyBody.content)
        console.log('will here-3')

      }

      for (let i = 0; i < data.length; i++) {
        if (!data[i].ProGrupo || !data[i].ProGrupoDe || !data[i].ProPreco || !data[i].quantity || !data[i].ProGruN || data.Procod) {
          Database.rollback()
          return response.status(401).send({
            Erro: 'Alguma das propriedades de Data não estão completas',
            1: data[i].ProGrupo,
            2: data[i].ProGrupoDe,
            3: data[i].ProPreco,
            4: data[i].quantity,
            5: data[i].ProGruN,
            6: data[i].Procod
          })
        }
      }
      if (!VendCod || !name || !totalAmount) {
        Database.rollback()
        return response.status(401).send(`Algum dos valores a seguir não foram atendidos de forma esperada ${{
          VendCod: VendCod, Name: name, totalAmount: totalAmount
        }}`)
      }
      console.log('will here-4')


      const cleanDate = date.replace(/([-])/g, '').substring(0, 8)
      const time = date.substring(11, 19)

      const firstOrCreate = await verifyFirstOrCreate(cleanDate, VendCod, Database)

      const data037 = {
        VenData: cleanDate,
        VenNro: 1,
        VenCod: VendCod,
        VenUser: name,
        VenEmpCod: 0,
        VenTot: totalAmount,
        VenTip: 'F',
        VenCFOP: null,
        VenNfNro: 0,
        VenDupNfNr: 0,
        Clicod: 1,
        VenCPF: null,
        VenCNPJ: null,
        VenHora: time,
        VenObs: null,
        VenSitVen: 0,
        PagEmpCod: 0,
        PagCod: 0,
        CobCod: 0,
        VenObsCan: null,
        VenDataCan: null,
        VenUserCan: null,
        vengerado: null,
        VenCobCod: 0,
        VenFatura: 0,
        VenOrigem: 1
      }

      const data038 = {
        VenData: cleanDate,
        VenNro: 1,
        VenCod: VendCod,
        VenItem: null, // Pra cada giro na inserção deve somar mais 1 // O valor deve ser null pois o giro tem que acontecer dentro do for
        vencfop: 0,
        VenSit: 0
      }

      console.log(data038)

      if (firstOrCreate === 'Not Found and created') {
        // Faz a inserção de dados nas tabelas REP037 e REP038 com Sequencial de valor = 1
        await Database
          .insert({
            ...data037
          })
          .into('REP037')

        for (let i = 0; i < data.length; i++) {
          
        await Database
            .insert({
              ...data038, VenItem: i + 1,
              VenQtde: data[i].quantity,
              VenValUni: data[i].ProPreco,
              ProGrupo: data[i].ProGrupo,
              VenGruDes: data[i].ProGrupoDe,
              VenProcod: data[i].Procod,
              vencfop: data[i].ProGruN
            })
            .into('REP038')
        }
        Database.commit()
        return response.status(200).send({
          vendaConcluida: true, VenNro: 1
        })
      }

      

      await Database
        .insert({
          ...data037, VenNro: firstOrCreate.SEQVENSeq
        })
        .into('REP037')

      for (let i = 0; i < data.length; i++) {

        console.log(data[i])


        await Database
          .insert({
            ...data038, VenItem: i + 1,
            VenNro: firstOrCreate.SEQVENSeq,
            VenQtde: data[i].quantity,
            VenValUni: data[i].ProPreco,
            ProGrupo: data[i].ProGrupo,
            VenGruDes: data[i].ProGrupoDe,
            VenProcod: data[i].Procod,
            vencfop: data[i].ProGruN
          })
          .into('REP038')
      }
      Database.commit()

      return response.status(200).send({
        vendaConcluida: true, VenNro: firstOrCreate.SEQVENSeq
      })
    } catch (e) {
      Database.rollback()
      return response.status(500).send(`Erro desconhecido ${e}`)
    }
  }

  async blindSale({request, response}) {
    const Database = await database.beginTransaction()
    const {token, date, VendCod, totalAmount} = request.all()

    try {
      const validate = await validation(response, token, date)
      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
      }
      if (!VendCod || !totalAmount) return response.status(401).send(`Algum dos valores a seguir não foram atendidos de forma esperada ${{
        VendCod: VendCod, totalAmount: totalAmount
      }}`)

      const cleanDate = date.replace(/([-])/g, '').substring(0, 8)
      const time = date.substring(11, 19)

      const firstOrCreate = await verifyFirstOrCreate(cleanDate, VendCod, Database)

      const data037 = {
        VenData: cleanDate,
        VenNro: 1,
        VenCod: VendCod,
        VenUser: validate.usermkt,
        VenEmpCod: 0,
        VenTot: totalAmount,
        VenTip: 'F',
        VenCFOP: null,
        VenNfNro: 0,
        VenDupNfNr: 0,
        Clicod: 1,
        VenCPF: null,
        VenCNPJ: null,
        VenHora: time,
        VenObs: null,
        VenSitVen: 4,
        PagEmpCod: 0,
        PagCod: 0,
        CobCod: 0,
        VenObsCan: null,
        VenDataCan: null,
        VenUserCan: null,
        vengerado: null,
        VenCobCod: 0,
        VenFatura: 0,
        VenOrigem: 1
      }
      // todo Futuramente a Patrícia vai me pedir para colocar um outro produto aqui!
      const data038 = {
        VenItem: 1,
        VenData: cleanDate,
        VenNro: 1,
        VenQtde: totalAmount / 16.9,
        VenCod: VendCod,
        vencfop: 510201, // Verificar futuramente se realmente no caso da venda cega é para ser salvo dessa maneira
        VenValUni: totalAmount,
        ProGrupo: 9248,
        VenGruDes: 'CANETA FANTASMINHA',
        VenProcod: '30341',
        VenSit: 0
      }

      if (firstOrCreate === 'Not Found and created') {
        await Database
          .insert({
            ...data037
          })
          .into('REP037')
        await Database
          .insert({
            ...data038
          })
          .into('REP038')
        Database.commit()
        return response.status(200).send({
          vendaConcluida: true, VenNro: firstOrCreate.SEQVENSeq
        })
      }

      await Database
        .insert({
          ...data037, VenNro: firstOrCreate.SEQVENSeq
        })
        .into('REP037')

      await Database
        .insert({
          ...data038, VenNro: firstOrCreate.SEQVENSeq
        })
        .into('REP038')

      Database.commit()
      return response.status(200).send({
        vendaConcluida: true, VenNro: firstOrCreate.SEQVENSeq
      })
    } catch (e) {
      Database.rollback()
      return response.status(500).send(`Erro desconhecido ${e}`)
    }
  }

  async confirmSale({request, response}) {
    const {token, date, VenData, VenNro, VenCod} = request.all()

    try {
      if (!token || !date || !VenData || !VenNro || !VenCod) return response.status(401).send('Algum dos parametros não foram preenchidos')
      const loggedUser = await validation(response, token, date)
      if (response._lazyBody.content && response.response.statusCode) {
        return response.status(response.response.statusCode).send(response._lazyBody.content)
      }

      await database
        .table('REP037')
        .where({
          VenData: VenData,
          VenNro: VenNro,
          VenCod: VenCod
        })
        .first()
        .update({
          VenSitVen: 5,
          VenEmpCod: loggedUser.MpFilPad
        })
      return response.status(200).send('Venda Concluida')
    } catch (e) {
      return response.status(500).send(`Erro desconhecido ${e}`)
    }
  }
}

module.exports = SaleController
