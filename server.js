const express = require('express')
const morgan = require('morgan')
const basicAuth = require('express-basic-auth')
const randomstring = require('randomstring')
const bodyParser = require('body-parser')


// 실무에서는 데이터를 이렇게 관리하지 않는다.
// 이렇게 만들어진 데이터는 메모리상에서 관리되는 것으로 새로고침시 사라지는 데이터이다.
const data = [
  {longURL: 'http://google.com', id:randomstring.generate(6)}
]

// http://localhost:3000/58DX37
// 302 응답

const app = express()

const authMiddleware = basicAuth({
  users: { 'admin': 'admin' },
  challenge: true,
  realm: 'Imb4T3st4pp'
})

const bodyParserMiddleWare = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs')
app.use('/static', express.static('public'))
app.use(morgan('tiny'))



app.get('/', authMiddleware, (req, res) => {
  res.render('index.ejs', {data})
})

app.get('/:id', (req, res) => {
  const id = req.params.id
  const matched = data.find(item => item.id === id)
  if(matched) {
    res.redirect(301, matched.longURL)
  } else {
    res.status(404)
    res.send('404 Not Found')
  }
})

app.post('/', bodyParserMiddleWare, authMiddleware, (req, res) => {
  const longURL = req.body.longURL
  let id;

  // id가 있으면 다시 만들고, 없으면 candidate를 저장하고 빠져나간다.
  while(true){
    // id가 될 후보
    const candidate = randomstring.generate(6)
    const matched = data.find(item => item.id === candidate)
    //matched가 없으면, 잘 된 상황
    if(!matched) {
      id = candidate
      break
    }
  }
  data.push({id, longURL})
  res.redirect('/')
})

app.listen(3000, () => {
  console.log('listening');
})