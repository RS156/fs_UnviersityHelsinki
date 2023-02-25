require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()
app.use(express.json())
morgan.token('post-data', (req, res) => {
  if (req.method === 'POST')
  {
    //console.log(res)
    return JSON.stringify(req.body)
  }
  })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.use(express.static('build'))


// let persons = [
//     { 
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

app.get('/api/persons',(request, response) =>{
    Person.find({}).then(persons => {
      response.json(persons)
    })
    
})

app.get('/info',(request, response) =>{
    const date = new Date()
    Person.find({}).then(persons => {
      response.send(`<div>Phonebook has info for ${persons.length} people</div><div>${date}</div>`)
    })
    
})

app.get('/api/persons/:id',(request, response) =>{
    Person.findById(request.params.id).then(person =>
      {
        response.json(person)
      })
    
})

app.delete('/api/persons/:id',(request, response, next) =>{
  Person.findByIdAndRemove(request.params.id)
  .then(res => {
      response.status(204).end()
    })
    .catch(error => next(error))    
})

app.put('/api/persons/:id',(request, response, next) =>{
  const body = request.body

const person = {
  name : body.name,
  number: body.number,
}
  Person.findByIdAndUpdate(request.params.id,person, {new : true})
  .then(res => {
      response.json(res)
    })
    .catch(error => next(error))    
})

app.post('/api/persons',(request, response) =>{ 
  const person = request.body
  if(!person.name || !person.number)
  {
    return response.status(400).json({
      "error":"name or number missing"
    })
  }
  // if(persons.filter(p => p.name === person.name).length !==0)
  // {
  //   return response.status(400).json({
  //     "error":"name must be unique"
  //   })
  // }
  const personObj = new Person(person) 
  personObj.save().then(p => {
    response.json(p)
  })
})

const errorHandler = (error, request, response, next)=>{
  console.error(error.message);

  next(error)
}

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
} )