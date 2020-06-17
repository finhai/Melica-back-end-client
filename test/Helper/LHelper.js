const { createDate } = require('../../app/Helpers/help')

async function login(client, username, password, date = createDate()) {
  return await client.post('/login')
    .send({
      usermkt: username,
      password: password,
      date: date
    })
    .end()
}


module.exports = {
  login,
  createDate
}
