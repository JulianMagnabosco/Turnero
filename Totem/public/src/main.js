$(document).ready(function () {
  
  let apiUrl = "http://localhost:8000/api/ticket/";
  let totemName = "totemName";
  const totemUrl = window.location.origin + "/totem/";
  const printerUrl = totemUrl + "ticket/";

  let options = [
    { code: "CO", name: "CO",lastNumber:1 },
  ];
  let groups = [
    { name: "Guardia", lines : [""] },
  ];
  
  let colors = ["rgb(92 0 179)", "rgb(0 128 179)", "rgb(128 179 0)","rgb(189 106 65)", "rgb(232 89 79)", "rgb(100 128 179)"];

  let codeSelected = "";
  let nameSelected = "";
  let groupSelected = "";
  let lastNumber = 0;

  const ajaxTimeout = 5000;
  let active = false;
  let timerPopups = 5000;

  let idTimeout = null;
  const goBackTimeout = 30000

  let tryAgainList = []
  tryAgainList=JSON.parse(localStorage.getItem("faileds") || "[]")

  $("#scroll-up").click(function (){
    scroll=0
    window.scroll({top: 0,left: 0,behavior: "smooth",});
  })

  let scroll = 0
  let step = 150
  $("#scroll-down").click(function (){
    scroll+=step
    window.scroll({top: scroll,left: 0,behavior: "smooth",});
  })

  let e = $(".button-turn").clone(true, true);
  $(".button-turn").removeClass("button-turn").hide();

  $("#loadingbar").hide()

  $.get(totemUrl, function (data) {
    
    apiUrl = data["apiUrl"];
    totemName = data["totem"];
    let oldOptions = JSON.parse(localStorage.getItem("options") || "[]")
    // console.log("Parsed: ")
    // console.log(oldOptions)
    options = data["lines"].map((l)=>{
      let oldO=undefined;
      if(oldOptions){
         oldO=oldOptions.find((ol)=>{return l.code==ol.code})
      }
      if(oldO){
        l.lastNumber=oldO.lastNumber
      }
      return l
    });
    // console.log("Fetched: ")
    // console.log(options)
    groups = data["groups"];
    options.forEach(function (option, index) {
      e.children().children()[1].innerText = option.code;
      e.children().children()[0].innerText = option.name;
      e.children().css("backgroundColor", colors[index % colors.length]);
      e.children().attr("data-code", option.code);
      e.children().attr("data-name", option.name);

      e.clone().appendTo("#button-list");
    })

    e.removeClass("button-turn");
    e.addClass("button-group");
    e.children().attr("data-code", "");
    
    groups.forEach(function (group, index) {
      e.children().children()[1].innerText = "Seleccionar";
      e.children().children()[0].innerText = group.name;
      e.children().css("backgroundColor", colors[index+1 % colors.length]);
      e.children().attr("data-b-group", group.name);
      group.lines.forEach((line )=> {
        $("[data-code='"+line+"']").parent().attr("data-group", group.name);
      })
      $("[data-group='"+group.name+"']").hide()

      e.clone().appendTo("#button-list");
    })
      e.children().children()[1].innerText = "Volver Atras";
      e.children().children()[0].innerText = "←←←";
      e.children().css("font-style", "italic")
      e.addClass("px-5")
      e.children().addClass("rounded-pill")
      e.children().css("backgroundColor", "rgb(100 100 100)");
      e.children().attr("data-b-group", "Back");

      e.clone().hide().appendTo("#button-list");

    $(".button-turn")
      .children()
      .click(function (e) {
        
        if (active) return;
        active = true;
        codeSelected = $(this).data("code");
        nameSelected = $(this).data("name");

        $("#loadingbar").show()
        
        getTicket();
      });
      
    $(".button-group")
      .children()
      .click(function (e) {
        groupSelected= $(this).data("b-group")
        clearTimeout(idTimeout)
        if(groupSelected=="Back"){
          goBack()
        }else{
          // $("#button-list").fadeOut(10)
          // $("#button-list").fadeIn(1000)
          $("#loadingbar").show()
          $("#loadingbar").hide(1000)
          $(".button-turn").hide()
          $(".button-group").hide()
          $("[data-b-group='Back']").parent().show()
          $(".button-turn[data-group='"+groupSelected+"']").show()
          $(this).parent().hide()

          idTimeout=setTimeout(function(){
            // const a = groupSelected
            // console.log("Timeout: "+a)
            goBack()
          },goBackTimeout)
          
        }

      });


  }).fail(function (){
    alert("Servidor desconectado")
  });;

  $("#state-popup").click(function () {
    $("#state-popup").hide();
  });
  $("#printer-popup").click(function () {
    $("#printer-popup").hide();
  });

  function goBack(){
          $("#loadingbar").show()
          $("#loadingbar").hide(1000)
    $(".button-group").show();
    $(".button-turn").show();
    $(".button-turn[data-group]").hide();
    $("[data-b-group='Back']").parent().hide()
  }

  function getTicket(){
    $.ajax({
      type: "POST",
      url: apiUrl,
      dataType: "json",
      contentType: "application/json",
      // async: false,
      timeout:ajaxTimeout,
      data: '{"code": "' + codeSelected +'", "totem": "' + totemName + '"}',
    })
      .done(function (data, status) {
        
        lastNumber = data["ticketNumber"];
        const op = options.find((e)=>e.code==codeSelected)
        op.lastNumber = lastNumber
        localStorage.setItem("options",JSON.stringify(options))

        $("#state-type").text(`Exito`);
        $("#state-popup").addClass(`bg-success`);
        $("#state-popup").removeClass(`bg-danger`);
        $("#state-title").text(
          `Turno para ${codeSelected} programado`
        );
      })
      .fail(function () {
        const op = options.find((e)=>e.code==codeSelected)
        lastNumber = (op.lastNumber)? op.lastNumber+1: 1;
        op.lastNumber = lastNumber
        localStorage.setItem("options",JSON.stringify(options))

        tryAgainList.push({code:codeSelected,lastNumber:lastNumber})

        $("#state-type").text(`Error`);
        $("#state-popup").removeClass(`bg-success`);
        $("#state-popup").addClass(`bg-danger`);
        $("#state-title").text(
          `No se pudo llamar al servidor, Se imprimira el ticket igualmente`
        );
      })
      .always(function () {

        $("#state-popup").show();
        callPrinter();
        setTimeout(function () {
          $("#state-popup").hide();
        }, timerPopups);
      });
  }

  function callPrinter() {
    // 

    $.ajax({
      type: "POST",
      url: printerUrl,
      dataType: "json",
      contentType: "application/json",
      // async: false,
      timeout:ajaxTimeout,
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
        
        $("#printer-state-type").text(`Exito`);
        $("#printer-popup").addClass(`bg-success`);
        $("#printer-popup").removeClass(`bg-danger`);
        $("#printer-state-title").text(`Ticket impreso`);
      })
      .fail(function () {
        $("#printer-state-type").text(`Error`);
        $("#printer-popup").addClass(`bg-danger`);
        $("#printer-popup").removeClass(`bg-success`);
        $("#printer-state-title").text(`No se pudo imprimir`);
      })
      .always(function () {
        codeSelected = "";
        active = false;
        $("#loadingbar").hide();
        goBack();

        $("#printer-popup").show();
        setTimeout(function () {
          $("#printer-popup").hide();
        }, timerPopups);
      });
  }

  setTimeout(()=>{tryAgain()},2000)
  function tryAgain(){
    // 
    if(!tryAgainList){
      tryAgainList=[]
    }
    if(tryAgainList.length<=0){
      setTimeout(()=>{tryAgain()},2000)
      return
    }
    $.ajax({
      type: "POST",
      url: apiUrl+"list/",
      dataType: "json",
      contentType: "application/json",
      timeout:ajaxTimeout,
      // async: false,
      data: JSON.stringify({"list":tryAgainList,"totem":totemName}),
    })
      .done(function (data, status) {
        // delete tryAgainList[index]
        // tryAgainList.splice(index)
        data["list"].forEach((e)=>{
          tryAgainList.splice(tryAgainList.findIndex((r)=>{e.code==r.code&&e.lastNumber==r.lastNumber}))
        })
      })
      .fail(function (data, status) {
        
      })
      .always(function (){
        localStorage.setItem("faileds",JSON.stringify(tryAgainList))
        setTimeout(()=>{tryAgain()},2000)
      })
  }
});
