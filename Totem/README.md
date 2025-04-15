# Totem

## Config.json
```
{
    "API_URL":"http://localhost:8000/api/addturn/",
    "LINES":[
        { "code": "CO", "name": "CO", "color": "rgb(179 0 0)" },
        { "code": "P", "name": "Pediatria", "color": "rgb(0 179 0)" },
        { "code": "CO", "name": "CO", "color": "rgb(179 0 0)" },
        { "code": "P", "name": "Pediatria", "color": "rgb(0 179 0)" },
        { "code": "C", "name": "coso", "color": "rgb(179 0 179)" }
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

## Run

`npm install`
`npm run dev`
