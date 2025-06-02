# Totem

## Dependencias a instalar

- Git
- Node.js
- Libudev


### Node.js
```
sudo apt upgrade
sudo apt install nodejs
sudo apt install npm
```

### Libudev
```
sudo apt-get update
```
- Linux, you'll need libudev to build libusb.
- Ubuntu/Debian: `sudo apt-get install build-essential libudev-dev`.
- Windows, Use Zadig to install the WinUSB driver for your USB device.

## Impresora

## Configuracion del programa
Crear archivo config.json.:

```
{
  "TOTEM":"totem1",
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

## Abrir puertos USB 

Crear un archivo startup.sh /etc/ o /usr/local/sbin/, y hacer `chmod 0700 /usr/local/sbin`, para liberar el usb.

```bash
#!/bin/bash
sudo chmod -R 777 /dev/bus/usb
```

Crear un archivo startup.service en /etc/systemd/system/, luego hacer `systemctl start startup.service` y `systemctl enable startup.service`

```
[Unit]
Description="startup usb"
[Service]
ExecStart=/usr/local/sbin/startup.sh
[Install]
WantedBy=multi-user.target
```

## Ejecutar

`npm install`
`npm run dev`

o ejecutar `chmod 0700 SETUP` y abrir SETUP como linea de comandos.
