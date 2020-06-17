'use strict'
const moment = use('moment')
const JobTime = use('App/Models/P0084E')
const Database = use('Database')
const Encryption = use('Encryption')

function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}

async function jobTimeHours(username) {
  const dateNowServer = await moment().format('YYYY-MM-DD')

  const jobTimeExist = await JobTime.query().select('usermkt', 'UserData', 'UserHoraI', 'UserHoraF')
    .where('usermkt', '=', username)
    .where('UserData', '>=', dateNowServer).first()

  if (!jobTimeExist) {
    return null
  }
  return jobTimeExist.toJSON()
}

function createDate (){
  return new Date(dateTimeCountrySpecify('+3'))
}

function dateTimeCountrySpecify(countryGMT) {
  const date = new Date()
  const dataConvertCountry = `${date.toGMTString()}${countryGMT}`
  return new Date(dataConvertCountry)
}


async function makeHour(username) {
  const serverDate = new Date(dateTimeCountrySpecify(''))
  const jobTimeHour = await jobTimeHours(username)

  const year = serverDate.getFullYear().toString()
  const month = ('0' + (serverDate.getMonth() + 1)).slice(-2)
  const initDay = serverDate.getDate()
  const day = initDay.toString().length === 1 ? '0' + initDay : initDay
  const initialHour = jobTimeHour.UserHoraI.substring(0, 2)
  const initialMinute = jobTimeHour.UserHoraI.substring(3, 5)
  const finalHour = jobTimeHour.UserHoraF.substring(0, 2)
  const finalMinute = jobTimeHour.UserHoraF.substring(3, 5)

  serverDate.setSeconds(0, 0)

  // Cria as datas para ser comparadas
  const createEntryDate = year + '-' + month + '-' + day + 'T' + initialHour + ':' + initialMinute + ':00.000Z'
  const createExitDate = year + '-' + month + '-' + day + 'T' + finalHour + ':' + finalMinute + ':00.000Z'
  const entryDate = new Date(createEntryDate)
  const exitDate = new Date(createExitDate)

  return {
    serverDate,
    entryDate,
    exitDate
  }
}

/*
console.log('Horario do banco    ',jobTimeHours.UserData)
console.log('Horario de entrada  ',entryDate)
console.log('Horario de Saida    ',exitDate)
console.log('Horario do Servidor ', serverDate)
console.log('Horario do APP      ', appDate)
console.log('Horario de Entrada é MAIOR que o de Saida? ', entryDate > appDate)
*/

function returnPages(totalRows, numberObjects) {
  let paginate = totalRows / numberObjects
  if (paginate % numberObjects > 0) {
    paginate = Math.ceil(paginate)
  }
  return paginate
}

async function validation(response, token, date, callback = null) {
  if (!token || !date) {
    return response.status(400).send('Requisição não válida')
  }

  const decrypted = Encryption.decrypt(token)

  if (!decrypted) {
    return response.status(401).send('Token não válido')
  }

  const data = await Database
    .select('usermkt', 'MpVenCod', 'MpFilPad')
    .table('P0084')
    .where('usermkt', '=', decrypted)
    .first()

  const appDate = new Date(date)
  // Preciso fazer uma verificação que obrigue no minimo 24 caracteres

  if (isValidDate(appDate) === false) {
    return response.status(401).send('Data não válida')
  }

  const jobTimeHoursExist = await jobTimeHours(decrypted, response)

  if (!jobTimeHoursExist) {
    return response.status(401).send('Nenhuma sessão registrada, por favor, contatar a gerência')
  }

  // Posso criar regra para verificar se o horário do celular está mto distante da do servidor
  // Todo Posso enviar uma mensagem para o front confirmar se o horário está correto como uma feature

  const timeDate = await makeHour(decrypted)

  // Cria as 3 regras de login do sistema
  // 1- O App não pode fazer login antes do horário do ServerDate
  // 2- O App não pode fazer login antes do horário de entrada
  // 3- O App não pode fazer login depois do horário de saída

  if (timeDate.serverDate >= appDate) {
    return response.status(401).send('Não é possível realizar login em horário pregresso do servidor!')
  }
  if (timeDate.entryDate >= appDate) {
    return response.status(401).send('Horário de entrada é anterior do permitido!')
  }
  if (timeDate.exitDate <= appDate) {
    return response.status(401).send('Horário de trabalho expirado')
  }
  if (callback) {
    return callback('data: '+data)
  }
  return data

}

function showPages(page) {

  let defaultMinValue = 0
  const defaultMaxValue = 30

  if (page !== 1) {

    const into = defaultMaxValue * page // Se o valor de página for 2 ele vai para o máximo de 60
    const from = into + 1 - 30

    return {into, from}
  }

  return {
    from: defaultMinValue,
    into: defaultMaxValue
  }
}

function message(id) {
  if (!id) return id
  if (typeof id !== 'number') return typeof id
}

module.exports = {
  isValidDate,
  jobTimeHours,
  makeHour,
  returnPages,
  validation,
  showPages,
  message,
  createDate
}
