const express = require('express')
const bodyParser = require('body-parser')
const { exec } = require('child_process')
const multer  = require('multer')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const fs = require('fs')

const convertedFolder = `${__dirname}/converted`
const dbFolder = `${__dirname}/db`
const downloadsFolder = `${__dirname}/public/downloads`
const uploadsFolder = `${__dirname}/uploads`

if (!fs.existsSync(convertedFolder)) fs.mkdirSync(convertedFolder)
if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder)
if (!fs.existsSync(downloadsFolder)) fs.mkdirSync(downloadsFolder)
if (!fs.existsSync(uploadsFolder)) fs.mkdirSync(uploadsFolder)

const upload = multer({ dest: 'uploads/' })
const app = express()
const adapter = new FileSync('db/conversions.json')
const db = low(adapter)

db.defaults({ conversions: []}).write()

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: true }))



app.post('/convert', upload.single('video'), (req, res) =>
{
    const file = req.file
    const destination = file.destination
    const filename = file.filename
    const originalname = file.originalname
    const basename = file.originalname.split('.')[0]
    const path = file.path

    if (!file.mimetype.startsWith('video'))
    {
        res.status(400).json({
            error: 'file must be a video'
        })

        fs.unlinkSync(path)

        return
    }

    db.get('conversions')
        .push({ id: filename, status: 'running' })
        .write()

    exec(`./convert.sh ${destination} ${filename} ${originalname} ${basename}`, (err, stdout, stderr) =>
    {
        if (err)
        {
            db.get('conversions')
                .find({ id: filename })
                .assign({ status: 'error' })
                .write()

            return
        }

        db.get('conversions')
            .find({ id: filename })
            .assign({ status: 'done' })
            .write()
    })

    res.send({
        id: file.filename
    })
})

app.get('/status/:id', (req, res) =>
{
    const status = db.get('conversions')
        .find({ id: req.params.id })
        .value()

    res.send({
        id: status.id,
        status: status.status
    })
})

app.listen(3000, () =>
{
    console.log('Converter listening on port 3000!')
})
