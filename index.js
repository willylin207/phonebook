'use strict';

const express = require('express')
const cors = require('cors')
const app = express()

const morgan = require('morgan')
const logger = morgan((tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify(req.body)
    ].join(' ')
})

app.use(cors())
app.use(express.json()) // json parser
app.use(logger)

let data = [
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

function generateSomewhatRandomId() {
    const SCALE = 2147483647
    return Math.floor(Math.random() * SCALE)
}

app.get('/api/persons', (req, res) => {
    res.json(data)
})

app.post('/api/persons', (req, res) => {
    if (!req.body.name || !req.body.number) {
        res.status(400)
           .json({ error: 'missing name or number' })
        return
    }
    
    if (data.find(person => person.name === req.body.name)) {
        res.status(409)
           .json({ error: 'a person with this name already exists in the phonebook' })
        return
    }
    
    const newEntry = {
        id: generateSomewhatRandomId(),
        name: req.body.name,
        number: req.body.number
    }
    
    data = data.concat(newEntry)
    res.status(200)
       .json(newEntry)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = data.find(person => person.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404)
           .json({ error: `no person exists with id ${id}` })
    }
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    data = data.filter(person => person.id !== id)

    res.status(204)
        .end()
})

app.get('/info', (req, res) => {
    const numEntries = data.length
    const timeReceived = new Date()
    const pageContent = `
        <p>Phonebook has info for ${numEntries} people</p>
        <p>${timeReceived}</p>
    `
    res.type('.html')
        .send(pageContent)
})


const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)