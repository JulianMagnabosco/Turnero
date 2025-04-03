var apiUrl = "http://localhost:8000/api/addturn/";

// var printerUrl = "http://localhost:2811/imprimir";
var getPrintersUrl = "http://localhost:2811/impresoras";
function printerUrl (opcion,nombre,numero){
  return `http://localhost/start-new?let=${opcion}%20&sala=la%20clinica&place=${nombre}&w=${numero}`
};

function printerBody (opcion,numero){
  return {
    "serial": "",
    "nombreImpresora": "impresora1",
    "operaciones": [
      {
        "nombre": "EscribirTexto",
        "argumentos": [`Numero para ${opcion}\n`],
      },
      {
        "nombre": "EstablecerTamañoFuente",
        "argumentos": [4, 4],
      },
      {
        "nombre": "EscribirTexto",
        "argumentos": [`${numero}\n`],
      },
      {
        "nombre": "Corte",
        "argumentos": [1]
      }
    ],
  }
};
