const { Pool } = require('pg')
const moment = require('moment')

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'trivia',
  password: '1234',
  max: 12,
  min: 2,
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 2000
})

async function get_user(email) {
  const client = await pool.connect()
  const { rows } = await client.query({
    text: 'select * from users where email = $1',
    values: [email]
  })
  client.release()
  return rows[0]
}
async function get_users() {
  const client = await pool.connect()
  const { rows } = await client.query({
    text: 'select * from users',
    values: []
  })
  client.release()
  return rows
}
async function create_user(name, email, password, es_admin) {
  const client = await pool.connect()
  await client.query({
    text: 'insert into users (name, email, password, es_admin) values ($1, $2, $3, $4)',
    values: [name, email, password, es_admin]
  })
  client.release()
}
async function create_question(pregunta, correcta, erronea1, erronea2) {

  const client = await pool.connect()

  await client.query({
    text: 'insert into questions (question, correct, fake_1, fake_2) values ($1, $2, $3, $4)',
    values: [pregunta, correcta, erronea1, erronea2]
  })

  client.release()
}
async function get_random_questions() {
  const client = await pool.connect()

  const { rows } = await client.query(
    'select * from questions ORDER BY RANDOM() LIMIT 3')

  client.release()
  return rows
}
async function consulta_respuesta(respuesta) {
  const client = await pool.connect()
  const { rows } = await client.query({
    text: 'select * from questions where correct = $1',
    values: [respuesta]
  })
  client.release()
  return rows
}
async function insert_games(user_id, score) {
  const client = await pool.connect()
  await client.query({
    text: 'insert into games (user_id, score) values ($1, $2)',
    values: [user_id, score]
  })
  client.release()
}
async function get_games() {
  const client = await pool.connect()
  const { rows } = await client.query({
    text: 'select games.id, name, score, games.date from games join users on user_id = users.id order by score desc',
    values: []
  })
  client.release()
  return rows
}
function formatDate(posts) {
    for (let i = 0; i < posts.length; i++) {
        const dateFormat = moment(posts[i].date).format('L');
        const timeFormat = moment(posts[i].date).format('LTS');
        posts[i].date = `${dateFormat} ${timeFormat}`
        // console.log(posts)
    }
}
async function validacion(dato){
  let puntaje = 0
  let validacion_respuesta = 0
  const respuestas = Object.values(dato)
  for(let i=0; i<respuestas.length;i++){
    validacion_respuesta = await consulta_respuesta(respuestas[i])
    puntaje += validacion_respuesta.length
  }
  return puntaje
}
module.exports = {
  get_user, create_user, create_question, get_users, get_games,
  get_random_questions, consulta_respuesta, insert_games, formatDate, validacion
}
