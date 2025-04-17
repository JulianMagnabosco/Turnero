const express = require('express')
const app = express()
const port = 4000

//escpos
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

var device = null
var printer = null
try{
    device  = new escpos.USB();
    const options = { encoding: "GB18030" /* default */ }
    printer = new escpos.Printer(device, options);
} catch {
    console.log("Sin impresora")
}
//json

const fs = require('fs');
let config = {
    "API_URL":"http://localhost:8000/api/addturn/",
    "LINES":[
        { "code": "CO", "name": "CO", "lastNumber": 1 },
        { "code": "P", "name": "Pediatria", "lastNumber": 5 },
        { "code": "CO", "name": "CO", "lastNumber": 10 }
    ]
  }
  
fs.readFile('config.json', function(err, data) { 
    if (err) {
        console.log("Sin config")
        return
    }

    config = JSON.parse(data); 
}); 

//express
app.use(express.json());

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// app.use("/src",express.static('public/src'))
// app.use("/libs",express.static('public/libs'))
app.use(express.static('public'))
app.get('/', (req, res) =>
    res.sendFile(__dirname + '/public/index.html')
);

app.get('/totem/', (req, res) =>
    res.send({
        apiUrl: config.API_URL,
        lines: config.LINES,
    })
);


app.post('/totem/ticket', (req, res) => {
    console.log(req.body)
    const nameSelected = req.body["name"]
    const codeSelected = req.body["code"]
    const lastNumber = req.body["lastNumber"]

    if (!nameSelected || !codeSelected || !lastNumber){
        res.status(400).send({
          message: 'Faltan datos',
        });
        return
    }
    if (config.PRINTER_OFF){
        console.log("Impresora Apagada")
        res.status(500).send({
          message: 'Impresora Apagada',
        });
        return
    }
    if (!device || !printer){
        console.log("Sin impresora")
        res.status(500).send({
          message: 'Sin Impresora',
        });
        return
    }

    device.open(function(error){
        printer
        .font('a')
        .align('ct')
        .size(2, 2)
        .text(`${codeSelected} ${lastNumber}\n`) // default encoding set is GB18030
        .size(1, 1)
        .text(`${nameSelected}\n`)
    	.cut()
    	.close();
      });
      res.send({
        message: 'Impreso',
      });
})
