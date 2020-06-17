'use strict'

const database = use('Database')
const P0084E = use('App/Models/P0084E')
const User = use('App/Models/P0084')
const Encryption = use('Encryption')
const {isValidDate, jobTimeHours, makeHour} = require('../../Helpers/help')


class UsuarioController {
  async login({request, response}) {
    const {usermkt, password, date} = request.all()
    console.log(date)
    try {
      if (!usermkt || !password || !date) {
        return response.status(400).send('Requisição não válida')
      }

      const username = usermkt.toString().toUpperCase()
      const appDate = new Date(date)

      if (isValidDate(appDate) === false) {
        return response.status(500).send('Data não válida')
      }

      const validate = await User.query().select('usermkt', 'MpSenhaN', 'MpVenCod')
        .where('usermkt', '=', username)
        .where('MpSenhaN', '=', password)
        .whereNotNull('MpVenCod')
        .first()

      if (!validate) {
        return response.status('400').send('Usuário não encontrado ou Codigo do vendedor não encontrado')
      }

      const jobTimeHoursExist = await jobTimeHours(username, response)
      if (!jobTimeHoursExist) {
        return response.status(401).send('Nenhuma sessão registrada, por favor, contatar a gerência')
      }
      const timeDate = await makeHour(username)

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
      
      const Token = {
        Token: await Encryption.encrypt(username),
        VenCod: validate.MpVenCod,
        Name: validate.usermkt,
      }
      return response.status('200').send(Token)
    } catch (e) {
      return response.status('404').send(`Requisição não encontrada. Error: ${e}`)
    }
  }

  async requestDate({request, response}) {
    const {token, venCod, onDate, name} = request.all()
    try{
      

    let decrypted = Encryption.decrypt(token) 

    console.log(decrypted)
    let date = onDate.substring(0, 10) + 'T00:00:00.000Z'

    console.log(token, venCod, onDate)
    console.log(venCod)
    console.log(date)


    console.log(date)   
      const data = await P0084E
      .query()
      .where('usermkt', name)
      .where('usermkt', decrypted) 
      .where('UserData', date)
      .where('UservenCod', venCod)
      .select('UserData', 'UserHoraI', 'UserHoraF')
      .fetch()
      console.log(data) 

      return response.status('200').send(data)
    } catch (e) {
      return response.status('404').send(`Requisição não encontrada. Error: ${e}`)
    }
  }
}

module.exports = UsuarioController
