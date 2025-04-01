$(document).ready(function () {
  const options = [
    { code: "CO", name: "CO", color: "rgb(179 0 0)" },
    { code: "P", name: "Pediatria", color: "rgb(0 179 0)" },
    { code: "C", name: "coso", color: "rgb(179 0 179)" },
  ];

  let codeSelected = "";

  let e = $(".button-turn").clone();
  $(".button-turn").hide();
  options.forEach(function (option) {
    e.children().children()[0].innerText = option.code;
    e.children().children()[1].innerText = option.name;
    e.children().css("backgroundColor", option.color);
    e.children().attr("data-code", option.code);
    e.children().attr("data-name", option.name);
    e.children().click(function () {
      codeSelected = $(this).attr("data-code");
      $("#choose-title").text(`¿Quieres programar un turno para ${option.name}?`);
    });

    e.clone().appendTo("#button-list");
  });

  $(".yes-button").click(function () {
    const url = window.location.origin + "/api/addturn/";
    $.post(
      url,
      {
        code: codeSelected,
      },
      function (data, status) {
        $("#state-title").text(
          `Turno para ${$(this).attr("data-name")} programado`
        );
      }
    )
      .fail(function () {
        $("#state-title").text(
          `Error Inesperado, Se imprimira el ticket igualmente`
        );
      })
      .always(function () {
        $("#choose-popup").hide();
        $("#state-popup").show();
        codeSelected = "";
      });
  });

  $(".no-button").click(function () {
    codeSelected = "";
    console.log($(this).parent().parent());
    $(this).parent().parent().hide();
  });
});
