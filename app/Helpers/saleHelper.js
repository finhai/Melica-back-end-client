'use strict'
const Database = use('Database')

async function verifyFirstOrCreate (cleanDate, VendCod, database = Database) {

  const searchSeller = await database
    .select('SEQVENData', 'SEQVENVen', 'SEQVENSeq')
    .table('SEQVEN')
    .where('SEQVENData', cleanDate)
    .where('SEQVENVen', VendCod)
    .first()

  if (!searchSeller) {
    //Se não achar nenhum registro, preciso criar um novo para o próximo utilizar
    //E devo criar o 1° com o SEQVENSeq = 2
    await database
      .insert({SEQVENData: cleanDate, SEQVENVen: VendCod, SEQVENSeq: 2})
      .into('SEQVEN')

    return 'Not Found and created'
  }
  const actualValor = await database
    .select('SEQVENData', 'SEQVENVen', 'SEQVENSeq')
    .table('SEQVEN')
    .where('SEQVENData', cleanDate)
    .where('SEQVENVen', VendCod)
    .first()

  await database
    .table('SEQVEN')
    .where({SEQVENData: cleanDate, SEQVENVen: VendCod})
    .update({SEQVENSeq: searchSeller.SEQVENSeq + 1})

  return actualValor
}

async function createitensSale (response, database, data, date, VendCod, VenData, VenNro) {
  for (let i = 0; i < data.length; i++) {
    if (!data[i].ProGrupo || !data[i].ProGrupoDe || !data[i].ProPreco || !data[i].VenQtde || !data[i].ProGruN || !data[i].Procod) {
      return response.status(401).send({
        Erro: 'Alguma das propriedades de Data não estão completas',
        1: data[i].ProGrupo,
        2: data[i].ProGrupoDe,
        3: data[i].ProPreco,
        4: data[i].VenQtde, // VenQtde
        5: data[i].ProGruN,
        6: data[i].Procod
      })
    }

  }

  const cleanDate = VenData.replace(/([-])/g, '').substring(0, 8)

  const data038 = {
    VenData: cleanDate,
    VenNro: VenNro,
    VenCod: VendCod,
    VenItem: null, // Pra cada giro na inserção deve somar mais 1 // O valor deve ser null pois o giro tem que acontecer dentro do for
    vencfop: 0,
    VenSit: 0
  }

  for (let i = 0; i < data.length; i++) {
    let sum = 1 + i
    await database
      .insert({
        ...data038, VenItem: sum,
        VenQtde: data[i].VenQtde,
        VenValUni: data[i].ProPreco,
        ProGrupo: data[i].ProGrupo,
        VenGruDes: data[i].ProGrupoDe,
        VenProcod: data[i].Procod,
        vencfop: data[i].ProGruN
      })
      .into('REP038')
  }
}

module.exports = {
  verifyFirstOrCreate,
  createitensSale
}
