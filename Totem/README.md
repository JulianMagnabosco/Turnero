# Totem

## Sistema operativo

Preferiblemente linux (probado en lubuntu), con el apagado o suspencion por tiempo desactivada.

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

- Linux, necesita libudev para armar libusb.
- Ubuntu/Debian: `sudo apt-get update` y luego `sudo apt-get install build-essential libudev-dev`.
- Windows, Use Zadig para instalar el driver WinUSB para la impresora.

## Configuracion del programa
Crear archivo config.json.:

```
{
  "TOTEM":"totem1",
  "API_URL": "http://192.168.2.114:3000/api/ticket/",
  "GROUPS":[
    {
      "name":"Mesa de Entrada",
      "lines":["U","N"]
    },
    {
      "name":"Imagenes",
      "lines":["C","S"]
    },
    {
      "name":"Guardia Central",
      "lines":["G","A"]
    }
  ],
  "LINES": [
    {
      "name": "Family Autorizaciones",
      "code": "F",
      "lastNumber": 1
    },
    {
      "name": "Mesa de Entrada con turno",
      "code": "U",
      "lastNumber": 1
    },
    {
      "name": "Mesa de Entrada sin turno",
      "code": "N",
      "lastNumber": 1
    },
    {
      "name": "Imagenes con turno",
      "code": "C",
      "lastNumber": 1
    },
    {
      "name": "Imagenes sin turno",
      "code": "S",
      "lastNumber": 1
    },
    {
      "name": "Guardia Pediatrica",
      "code": "G",
      "lastNumber": 1
    },
    {
      "name": "Guardia Adulto",
      "code": "A",
      "lastNumber": 1
    }
  ]
}


```

## Abrir puertos USB 

Crear un archivo startup.sh /etc/ o /usr/local/sbin/ (`sudo nano /usr/local/sbin/startup.sh`), y hacer `sudo chmod 0700 /usr/local/sbin/startup.sh`, para liberar el usb.

```bash
#!/bin/bash
sudo chmod -R 777 /dev/bus/usb
```

Crear un archivo startup.service en /etc/systemd/system/ (`sudo nano /etc/systemd/system/startup.sh`), luego hacer `sudo systemctl start startup.service` y `sudo systemctl enable startup.service`

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

o ejecutar `chmod 0700 SETUP` o Propiedades>'Hacer ejecutable' y abrir SETUP como linea de comandos.
