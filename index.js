const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express()

const url = "mongodb+srv://tmb23:TTbm2001@cluster0.i5pru.mongodb.net/ToDo?retryWrites=true&w=majority";

MongoClient.connect(url, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('ToDo')
    const quotesCollection = db.collection('ToDo')

    // ========================
    // Middlewares
    // ========================
    app.set('view engine', 'ejs')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(express.static('public'))

    // ========================
    // Routes
    // ========================
    app.get('/task', (req, res) => {
      db.collection('ToDo').find().toArray()
        .then(tasks => {
          res.render('index.ejs', { tasks: tasks })
          console.log("reading");
          if (tasks.length > 0) {
            tasks.forEach((task) => {
                //console.log(task);
            });
          } else {
              console.log("Nothing to do");
          }
        })
        .catch(error => console.error(error))
    })

    app.post('/task', (req, res) => {
      console.log('posting');
      console.log(req.body);
      quotesCollection.insertOne({ description: req.body.description, isComplete: false })
        .then(
          res.redirect("/task")
        )
        .catch(error => console.error(error))
    })

    app.put('/task/toggle/:id', (req, res) => {
      console.log("toggling");
      console.log(req.params.id);
      db.collection('ToDo').findOne({ description: req.params.id })
        .then(c => {
          client.db("ToDo").collection("ToDo").updateOne({ description: req.params.id }, { $set: { isComplete: !c.isComplete} })
            .then(
              res.json({ redirect: '/task'})
            )
            .catch(error => console.error(error))
        })
    })

    app.delete('/task/:id', (req, res) => {
      console.log("deleting");
      console.log(req.params.id);
      client.db("ToDo").collection("ToDo").deleteOne({ description: req.params.id})
        .then(result => {
          res.json({ redirect: '/task'})
        })
        .catch(error => console.error(error))
    })

    // ========================
    // Listen
    // ========================
    
    const port = 8000
    app.listen(port, function () {
      console.log(`listening on ${port}`)
    })
  })
  .catch(console.error)