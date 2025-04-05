# Totem

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