'use strict'
const {login, createDate} = require('../Helper/LHelper')

const {test, trait} = use('Test/Suite')('Login')

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('Testa a aplicação de CamelCase', async ({client}) => {

  const response = await login(client, 'supEr', '2001')
  response.assertStatus(200)
})

test('Testa situação com falta dos dados esperados', async ({client}) => {

  let response = await login(client, '', '2001')
  response.assertStatus(400)
  response.assertError('Requisição não válida')

  response = await login(client, 'super', '')
  response.assertStatus(400)
  response.assertError('Requisição não válida')

  response = await login(client, 'super', '2001', '')
  response.assertStatus(400)
  response.assertError('Requisição não válida')
})
