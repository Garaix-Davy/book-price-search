var debugDiv = document.getElementById("debug");
var resultsBody = document.getElementById("resultsBody");
var historyBody = document.getElementById('historyBody');




function toggleScanner(){
  var scanButton = document.getElementById("scan");
  if (scanButton.getAttribute("clicked") === "false"){
    scanButton.setAttribute("clicked","true");
    scanButton.innerHTML = "Stop Scanner";
    start();
  } else {
    Quagga.stop();
    scanButton.setAttribute("clicked","false");
    scanButton.innerHTML = "Scan Barcode";
    //searchEbay("9781595550781"); // for testing - remove this.
  }
}

// function searchEbay(isbnValue){
//
//     results.innerHTML = "";
//     var appID = "DavyGara-bookpric-PRD-a78731904-738f601d";
//     var url = 'https://svcs.ebay.com/services/search/FindingService/v1'
//                       +'?OPERATION-NAME=findCompletedItems'
//                       +'&SECURITY-APPNAME=' + appID
//                       +'&GLOBAL-ID=EBAY-US'
//                       +'&RESPONSE-DATA-FORMAT=JSON'
//                       +'&REST-PAYLOAD'
//                       +'&keywords=' + isbnValue
//                       +'&categoryId=267'
//                       +'&itemFilter(0).name=SoldItemsOnly'
//                       +'&itemFilter(0).value=true'
//                       +'&sortOrder=EndTimeSoonest'
//                       +'&paginationInput.entriesPerPage=10';
//
//     var xhr = new XMLHttpRequest();
//     xhr.open('GET', url );
//     xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true');
//     xhr.send();
//     xhr.onreadystatechange = function() {
//       if (xhr.readyState === 4 && xhr.status === 200) {
//         var resp = JSON.parse(xhr.responseText);
//         var books = resp.findCompletedItemsResponse[0].searchResult[0].item || [];
//         var html = [];
//         if (books.length > 0){
//           html.push('<table id="bookTable">');
//           html.push('<tr><th>Book Title ('+isbnValue+')</th><th>Condition</th><th>Sold Price (shipping included)</th><th>Date Sold</th></tr>');
//           for (i = 0; i < books.length; i++) {
//               var bookTitle = books[i].title;
//               var bookCondition = books[i].condition[0].conditionDisplayName;
//               var bookShippingCost = 0;
//               if (books[i].hasOwnProperty('shippingInfo') && books[i].shippingInfo[0].hasOwnProperty('shippingServiceCost')){
//                 bookShippingCost = parseFloat(books[i].shippingInfo[0].shippingServiceCost[0].__value__);
//               }
//               var bookSoldPrice = parseFloat(books[i].sellingStatus[0].currentPrice[0].__value__) + bookShippingCost;
//               var dateSold = books[i].listingInfo[0].endTime.toString().substring(0,10);
//               html.push('<tr><td>'+bookTitle+'</td><td>'+bookCondition+'</td><td>'+'$'+bookSoldPrice.toFixed(2)+'</td><td>'+dateSold+'</td></tr>');
//           }
//           html.push('</table>');
//           results.innerHTML = html.join("");
//         } else {
//           results.innerHTML = "Sorry, this book didn't sell on eBay (US) recently. Please scan another.";
//         }
//       } else {
//         results.innerHTML = "Error: " + xhr.status + "<br>";
//       }
//     }
// }

function searchEbay(isbnValue) {
    Quagga.stop();
    resultsBody.innerHTML = "";
    var appID = "DavyGara-bookpric-PRD-a78731904-738f601d";
    // added free CORS proxy to make this work.
    var url = 'https://crossorigin.me/'
                      +'http://svcs.ebay.com/services/search/FindingService/v1'
                      +'?OPERATION-NAME=findCompletedItems'
                      +'&SECURITY-APPNAME=' + appID
                      +'&GLOBAL-ID=EBAY-US'
                      +'&RESPONSE-DATA-FORMAT=JSON'
                      +'&REST-PAYLOAD'
                      +'&keywords=' + isbnValue
                      +'&categoryId=267'
                      +'&itemFilter(0).name=SoldItemsOnly'
                      +'&itemFilter(0).value=true'
                      +'&sortOrder=EndTimeSoonest'
                      +'&paginationInput.entriesPerPage=10';

  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    var resp = JSON.parse(xhr.responseText);
    var books = resp.findCompletedItemsResponse[0].searchResult[0].item || [];
    var html = [];
    if (books.length > 0){
      html.push('<table id="bookTable">');
      html.push('<tr><th>ISBN: '+isbnValue+'</th><th>Condition</th><th>Sold Price*</th><th>Date Sold</th></tr>');
      for (i = 0; i < books.length; i++) {
          var bookTitle = books[i].title;
          var bookCondition = books[i].condition[0].conditionDisplayName;
          var bookShippingCost = 0;
          if (books[i].hasOwnProperty('shippingInfo') && books[i].shippingInfo[0].hasOwnProperty('shippingServiceCost')){
            bookShippingCost = parseFloat(books[i].shippingInfo[0].shippingServiceCost[0].__value__);
          }
          var bookSoldPrice = parseFloat(books[i].sellingStatus[0].currentPrice[0].__value__) + bookShippingCost;
          var dateSold = books[i].listingInfo[0].endTime.toString().substring(0,10);
          html.push('<tr><td>'+bookTitle+'</td><td>'+bookCondition+'</td><td>'+'$'+bookSoldPrice.toFixed(2)+'</td><td>'+dateSold+'</td></tr>');
      }
      html.push('</table>');
    } else {
      html.push("<p>Sorry, this book didn't sell on eBay (US) recently. Please scan another.</p>");
    }

    resultsBody.innerHTML = html.join("");
    // saves to local storage
    localStorage.setItem(isbnValue,html.join(""));
    toggleResults();
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  xhr.send();
}

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// The function below is a modified version of the barcode API for this app.
function start() {
    var App = {
        init : function() {
            Quagga.init(this.state, function(err) {
                if (err) {
                    console.log(err);
                    return;
                }
                App.attachListeners();
                App.checkCapabilities();
                Quagga.start();
            });
        },
        checkCapabilities: function() {
            var track = Quagga.CameraAccess.getActiveTrack();
            var capabilities = {};
            if (typeof track.getCapabilities === 'function') {
                capabilities = track.getCapabilities();
            }
            this.applySettingsVisibility('zoom', capabilities.zoom);
            this.applySettingsVisibility('torch', capabilities.torch);
        },
        updateOptionsForMediaRange: function(node, range) {
            console.log('updateOptionsForMediaRange', node, range);
            var NUM_STEPS = 6;
            var stepSize = (range.max - range.min) / NUM_STEPS;
            var option;
            var value;
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            for (var i = 0; i <= NUM_STEPS; i++) {
                value = range.min + (stepSize * i);
                option = document.createElement('option');
                option.value = value;
                option.innerHTML = value;
                node.appendChild(option);
            }
        },
        applySettingsVisibility: function(setting, capability) {
            // depending on type of capability
            if (typeof capability === 'boolean') {
                var node = document.querySelector('input[name="settings_' + setting + '"]');
                if (node) {
                    node.parentNode.style.display = capability ? 'block' : 'none';
                }
                return;
            }
            if (window.MediaSettingsRange && capability instanceof window.MediaSettingsRange) {
                var node = document.querySelector('select[name="settings_' + setting + '"]');
                if (node) {
                    this.updateOptionsForMediaRange(node, capability);
                    node.parentNode.style.display = 'block';
                }
                return;
            }
        },
        attachListeners: function() {
            var self = this;

            $(".controls").on("click", "button.stop", function(e) {
                e.preventDefault();
                Quagga.stop();
            });

        },
        detachListeners: function() {
            $(".controls").off("click", "button.stop");
        },
        state: {
            inputStream: {
                type : "LiveStream",
                constraints: {
                    width: {min: 640},
                    height: {min: 480},
                    facingMode: "environment" // or user
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers : [{
                    format: "ean_reader",
                    config: {}
                }]
            },
            locate: true
        },
        lastResult : null
    };

    App.init();

    Quagga.onProcessed(function(result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
            drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
        }
    });

    Quagga.onDetected(function(result) {
        var code = result.codeResult.code;
        Quagga.stop();
        toggleScanner();
        var isbn = document.getElementById("number");
        isbn.value = code;
        searchEbay(isbn.value);

        // if (App.lastResult !== code) {
        //     App.lastResult = code;
        //     var isbn = document.getElementById("number");
        //     isbn.value = code;
        //
        //     toggleScanner();
        //     searchEbay(isbn.value);
        //
        // }
    });
}

// displays the About modal box


function toggleAbout(){
  if (document.getElementById('about').style.display=='block'){
    document.getElementById('about').style.display='none';
  } else {
    document.getElementById('about').style.display='block';
  }
}

function toggleResults(){
  if (document.getElementById('results').style.display=='block'){
    document.getElementById('results').style.display='none';
  } else {
    document.getElementById('results').style.display='block';
  }
}

function toggleHistory(){
  if (document.getElementById('history').style.display=='block'){
    document.getElementById('history').style.display='none';
  } else {
    document.getElementById('history').style.display='block';
  }
  historyBody.innerHTML = formHistory();
}

function manualSearch(){
  var isbn = document.getElementById("number");
  searchEbay(isbn.value);
}

function formHistory(){
  historyContent = "";

  for (var i = 0; i < localStorage.length; i++){

    historyContent +='<div class="wrap-collabsible">'
                    +'<input id="'+localStorage.key(i)+'" class="toggle" type="checkbox">'
                    +'<label for="'+localStorage.key(i)+'" class="lbl-toggle">'
                    +localStorage.key(i) //isbn from localStorage
                    + ' (' + dateStamp() + ')'
                    +'</label><div class="collapsible-content">'
                    +'<div class="content-inner">'
                    +'<p>'
                    +localStorage.getItem(localStorage.key(i)) //table from localStorage
                    +'</p></div></div></div>';
    }
    return historyContent;
}

function dateStamp(){
  var date = new Date();
  var month = (date.getMonth()+1).toString().length == 1 ? ("0" + parseInt(date.getMonth()+1)) : date.getMonth()+1;
  var day = date.getDate().toString().length == 1 ? ("0" + date.getDate()) : date.getDate();
  return date.getFullYear() + "-" + month + "-" + day;
}
