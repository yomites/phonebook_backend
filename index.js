const express = require('express')
const morgan = require ('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(express.static('build'))
morgan.token('type', function (req, res) { return JSON.stringify(req.body)})
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

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`<div><h3>Phonebook has info for 
        ${persons.length} people</h3></div><div><h3>
        ${new Date()}</h3></div>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    person ? response.json(person) : 
        response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body, body.name, body.number)

    if (!body.name) {
        return response.status(400).json({ error: 'name missing' })
    } else if (!body.number) {
        return response.status(400).json({ error: 'number missing' })
    }
  
    const person = {
        id: idGenerator(),
        name: body.name,
        number: body.number
    }

    const duplicateName = persons.find(p => 
        p.name.toLowerCase() === person.name.toLowerCase())
  
    if (duplicateName) {
        return response.status(400).json({ error: 'name must be unique' })
    } else {
        persons = persons.concat(person)
        response.json(person)
    }
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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})