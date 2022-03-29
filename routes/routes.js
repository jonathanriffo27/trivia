const express = require('express')
const fs = require('fs').promises
const flash = require('connect-flash')

const { 
  create_question, get_random_questions, consulta_respuesta, insert_games,
  get_games, formatDate, validacion 
} = require('../db.js')


const router = express.Router()

function protected_route (req, res, next) {
  if (!req.session.user) {
    // si quiere trabajar sin rutas prptegidas, comente la siguiente línea
    return res.redirect('/login')
  }
  next()
}
function role_admin (req, res, next) {
  if (req.session.user.es_admin == false) {
  //   // si quiere trabajar sin rutas prptegidas, comente la siguiente línea
    req.flash('errors', 'Solo el administrador puede crear preguntas')
    return res.redirect('/')
  }
  // console.log(req.session.user.es_admin)
  next()
}

// RUTAS
router.get('/', protected_route, async (req, res) => {
  const errors = req.flash('errors')
  const mensajes = req.flash('mensajes')
  const games = await get_games()
  const game_format = await formatDate(games)
  res.render('index.html',{errors, games, mensajes})
})

router.get('/question', protected_route, role_admin, async (req, res) => {

  res.render('question.html', {})
})
router.post('/question', async (req, res) => {
  const pregunta = req.body.pregunta
  const correcta = req.body.correcta
  const erronea1 = req.body.erronea1
  const erronea2 = req.body.erronea2
  await create_question(pregunta, correcta, erronea1, erronea2)
  res.redirect('/question')
});
router.get('/play', protected_route, async (req, res) => {
  const preguntas = await get_random_questions()
  preguntas.map(pregunta => {
    const respuestas = [pregunta.correct, pregunta.fake_1, pregunta.fake_2]
    pregunta.respuestas = respuestas.sort((a,b) => 0.5 - Math.random())
  })
  res.render('play.html', {preguntas})
})
router.post('/play/:user_id', async (req, res) => {
  const puntaje = await validacion(req.body)
  const porcentaje = Math.round((puntaje * 100)/3)
  await insert_games(req.params.user_id, puntaje)
  req.flash('mensajes', `Tu puntaje fue de ${puntaje}/3 (${porcentaje}%)`)
  res.redirect('/')
});
module.exports = router
