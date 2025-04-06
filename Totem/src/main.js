const escpos = require('../');

const device  = new escpos.USB();
// const device  = new escpos.RawBT();
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');
const printer = new escpos.Printer(device);

$(document).ready(function () {


  const options = [
    { code: "CO", name: "CO", color: "rgb(179 0 0)" },
    { code: "P", name: "Pediatria", color: "rgb(0 179 0)" },
    { code: "C", name: "coso", color: "rgb(179 0 179)" },
  ];

  let codeSelected = "";
  let nameSelected = "";
  let lastNumber = 0;
  let active = false;

  let e = $(".button-turn").clone();
  $(".button-turn").hide();
  options.forEach(function (option) {
    e.children().children()[0].innerText = option.code;
    e.children().children()[1].innerText = option.name;
    e.children().css("backgroundColor", option.color);
    e.children().attr("data-code", option.code);
    e.children().attr("data-name", option.name);

    e.clone().appendTo("#button-list");
  });

  $(".button-turn")
    .children()
    .click(function (e) {
      codeSelected = $(this).data("code");
      nameSelected = $(this).data("name");
      $("#choose-title").html(
        `¿Quieres programar un turno para <b>${nameSelected}</b>?`
      );
    });

  $(".yes-button").click(function () {
    if (active) return;
    active = true;
    $.post(
      apiUrl,
      {
        code: codeSelected,
      },
      function (data, status) {
        console.log(data);
        lastNumber = data["ticketNumber"];
        $("#state-type").text(`Exito`);
        $("#liveToast").addClass(`bg-success`);
        $("#liveToast").removeClass(`bg-danger`);
        $("#state-title").text(
          `Turno para ${$(this).attr("data-name")} programado`
        );
      }
    )
      .fail(function () {
        lastNumber++;
        $("#state-type").text(`Error`);
        $("#liveToast").removeClass(`bg-success`);
        $("#liveToast").addClass(`bg-danger`);
        $("#state-title").text(
          `A ocurrido algo inesperado, Se imprimira el ticket igualmente`
        );
      })
      .always(function () {
        $("#state-popup").children().show();
        setTimeout(function () {
          callPrinter();
        }, 1000);
      });
  });

  $("#state-popup").click(function () {
    $("#state-popup").children().hide();
  });

  function callPrinter() {
    console.log(printerUrl(codeSelected, nameSelected, lastNumber));

    device.open(function(err){

      printer
      .getStatuses(statuses => {
        statuses.forEach(status => {
            console.log(status.toJSON());
        })
      })
      .font('a')
      .align('ct')
      .size(2, 2)
      .text(`${lastNumber}\n`) // default encoding set is GB18030
      .size(1, 1)
      .text(`${nameSelected}-${codeSelected}\n`) // default encoding set is GB18030
      .cut()
      .close();
    });

    // $.get(
    //   printerUrl(codeSelected, nameSelected, lastNumber),
    //   function (data, status) {
    //     $("#state-type").text(`Exito`);
    //     $("#liveToast").addClass(`bg-success`);
    //     $("#liveToast").removeClass(`bg-danger`);
    //     $("#state-title").text(`Ticket impreso`);
    //     codeSelected = "";
    //   }
    // )
    //   .fail(function () {
    //     $("#state-type").text(`Error`);
    //     $("#liveToast").addClass(`bg-danger`);
    //     $("#liveToast").removeClass(`bg-success`);
    //     $("#state-title").text(`No se pudo imprimir`);
    //     codeSelected = "";
    //   })
    //   .always(function () {
        active = false;
    //     $("#state-popup").children().show();
    //     setTimeout(function () {
    //       $("#state-popup").children().hide();
    //     }, 2000);
    //   });
  }
});
