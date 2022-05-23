require('dotenv').config()
const express = require('express')
const morgan = require ('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

morgan.token('type', function (req, res) { return JSON.stringify(req.body)})
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))
app.use(cors())

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.find({}).then(persons => {
        response.send(`<div><h3>Phonebook has info for 
        ${persons.length} people</h3></div><div><h3>
        ${new Date()}</h3></div>`)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id).then(result => {  
        console.log(result)   
        response.status(204).end()       
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    console.log(body, body.name, body.number)

    if (body.name === undefined) {
        return response.status(400).json({ error: 'name missing' })
    } else if (body.number === undefined) {
        return response.status(400).json({ error: 'number missing' })
    }
  
    const person = new Person({
        id: idGenerator(),
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson)
            } else {
                response.status(404).end()
            }
            
        }).catch(error => next(error))
})

const idGenerator = () => {

    const idArray = persons.map(p => p.id)
    const maxId = persons.length * 5
    const minId = 1
    console.log(idArray, maxId, minId)
  
    const idFinder = () => {
        const id = Math.floor(Math.random() * (maxId - minId + 1)) + minId
        console.log('Generated id',id)
        const idFilter = idArray.filter(a => a === id)
        // Recursive algorithm to test the generated id availability
        if (idFilter.length !== 0) {
            return idFinder()
        } else {
            return id
        }
    }
    return idFinder()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
 
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
  
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})