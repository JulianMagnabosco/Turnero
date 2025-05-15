# Totem

## Config.json
```
{
  "API_URL": "http://localhost:3000/api/ticket/",
  "LINES": [
    {
      "name": "Guardia Central",
      "code": "GC",
      "lastNumber": 1
    },
    {
      "name": "Family Autorizaciones",
      "code": "FA",
      "lastNumber": 1
    },
    {
      "name": "Mesa de Entrada",
      "code": "ME",
      "lastNumber": 1
    },
    {
      "name": "Imagenes",
      "code": "IMG",
      "lastNumber": 1
    },
    {
      "name": "Guardia Adulto",
      "code": "GA",
      "lastNumber": 1
    },
    {
      "name": "Guardia Pediatrica",
      "code": "GP",
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
