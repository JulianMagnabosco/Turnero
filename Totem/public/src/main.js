$(document).ready(function () {
  console.log(window.location);
  let apiUrl = "http://localhost:8000/api/addturn/";
  const totemUrl = window.location.href + "totem/";
  const printerUrl = totemUrl + "ticket/";

  let options = [
    { code: "CO", name: "CO" },
    { code: "P", name: "Pediatria" },
    { code: "C", name: "coso" },
  ];
  let colors = ["rgb(179 0 179)", "rgb(0 179 179)", "rgb(100 200 0)"];

  let codeSelected = "";
  let nameSelected = "";
  let lastNumber = 0;

  let active = false;
  let timer = null;

  let e = $(".button-turn").clone(true, true);
  $(".button-turn").hide();

  $.get(totemUrl, function (data) {
    console.log(data);
    apiUrl = data["apiUrl"];
    options = data["lines"];
    options.forEach(function (option, index) {
      e.children().children()[1].innerText = option.code;
      e.children().children()[0].innerText = option.name;
      e.children().css("backgroundColor", colors[index % colors.length]);
      e.children().attr("data-code", option.code);
      e.children().attr("data-name", option.name);

      e.clone().appendTo("#button-list");
    });

    $(".button-turn")
      .children()
      .click(function (e) {
        codeSelected = $(this).data("code");
        nameSelected = $(this).data("name");
        console.log($(this).data("code"));
        $("#choose-title").html(
          `¿Quieres programar un turno para <b>${nameSelected}</b>?`
        );
      });
  });

  $(".yes-button").click(function () {
    if (active) return;
    active = true;
    $.ajax({
      type: "POST",
      url: apiUrl,
      dataType: "json",
      // async: false,
      data: '{"code": "' + codeSelected + '"}',
    })
      .done(function (data, status) {
        console.log(data);
        lastNumber = data["ticketNumber"];
        $("#state-type").text(`Exito`);
        $("#liveToast").addClass(`bg-success`);
        $("#liveToast").removeClass(`bg-danger`);
        $("#state-title").text(
          `Turno para ${$(this).attr("data-name")} programado`
        );
      })
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
        timer = setTimeout(function () {
          callPrinter();
        }, 1000);
      });
  });

  $("#state-popup").click(function () {
    $("#state-popup").children().hide();
  });

  function callPrinter() {
    // console.log(printerUrl(codeSelected, nameSelected, lastNumber));

    $.ajax({
      type: "POST",
      url: printerUrl,
      dataType: "json",
      contentType: "application/json",
      // async: false,
      data:
        '{"code": "' +
        codeSelected +
        '","name":"' +
        nameSelected +
        '","lastNumber":' +
        lastNumber +
        "}",
    })
      .done(function (data, status) {
        console.log("Exito")
        // $("#state-type").text(`Exito`);
        // $("#liveToast").addClass(`bg-success`);
        // $("#liveToast").removeClass(`bg-danger`);
        // $("#state-title").text(`Ticket impreso`);
      })
      .fail(function () {
        $("#state-type").text(`Error`);
        $("#liveToast").addClass(`bg-danger`);
        $("#liveToast").removeClass(`bg-success`);
        $("#state-title").text(`No se pudo imprimir`);
      })
      .always(function () {
        codeSelected = "";
        active = false;

        $("#state-popup").children().show();

        clearTimeout(timer);
        timer = setTimeout(function () {
          $("#state-popup").children().hide();
        }, 1000);
      });
  }
});
