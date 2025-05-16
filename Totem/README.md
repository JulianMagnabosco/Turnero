# Totem

## Config.json
```
{
  "API_URL": "http://localhost:3000/api/ticket/",
  "GROUPS":[
    {
      "name":"Guardia",
      "lines":["CGU","PGU","AGU"]
    }
  ],
  "LINES": [
    {
      "name": "Guardia Central",
      "code": "CGU",
      "lastNumber": 1
    },
    {
      "name": "Family Autorizaciones",
      "code": "FAM",
      "lastNumber": 1
    },
    {
      "name": "Mesa de Entrada",
      "code": "MES",
      "lastNumber": 1
    },
    {
      "name": "Imagenes",
      "code": "IMG",
      "lastNumber": 1
    },
    {
      "name": "Guardia Adulto",
      "code": "AGU",
      "lastNumber": 1
    },
    {
      "name": "Guardia Pediatrica",
      "code": "PGU",
      "lastNumber": 1
    }
  ]
}

```

## Dependencias
- Linux, you'll need libudev to build libusb.
- Ubuntu/Debian: `sudo apt-get install build-essential libudev-dev`.
- Windows, Use Zadig to install the WinUSB driver for your USB device.

```
{
  "dependencies": {
    "escpos": "^3.0.0-alpha.6",
    "escpos-usb": "^3.0.0-alpha.4",
    "usb": "^1.9.2"
  }
}

```

# Linux
```
sudo chmod -R 777 /dev/bus/usb
```

## Run

`npm install`
`npm run dev`
