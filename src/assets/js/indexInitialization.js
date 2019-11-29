var global = global || window;
      
//http://upload.wikimedia.org/wikipedia/commons/5/51/Google.png
//Size = 238 KB
//var imageAddr = "https://sample-videos.com/img/Sample-jpg-image-30mb.jpg";
//var startTime, endTime;
//var downloadSize = 30000000;
//var download = new Image();

//download.onload = function() {
//  endTime = (new Date()).getTime();
//  showResults();
//}

var startTime = (new Date()).getTime() ; 
var loadDuration;

// download.src = imageAddr ;
function getStartTime(){
  return startTime;
}

function setLoadDuration(paramDuration){
  loadDuration = paramDuration;
}

function getLoadDuration(){
  return loadDuration;
}

function setMuuri(){
  var grid = new Muuri('.snv-main-cont', {
             dragEnabled: true,
             dragContainer: document.getElementById('snv-content-id')
            });
  return grid;
}

function setNewSavableMuuri(){
  var grid = new Muuri('.snv-main-cont',{
      dragEnabled: true,
      dragContainer: document.getElementById('snv-content-id'),
      layoutOnInit: false
      }).on('move', function () {
          saveLayout(grid);
  });
  return grid;
}      

function serializeLayout(grid) {
  var itemIds = grid.getItems().map(function (item) {
    return item.getElement().getAttribute('data-id');
  });
  return JSON.stringify(itemIds);
}

function saveLayout(grid) {
  var layout = serializeLayout(grid);
  window.localStorage.setItem('layout', layout);
}

function loadLayout(grid, serializedLayout) {
  var layout = JSON.parse(serializedLayout);
  var currentItems = grid.getItems();
  var currentItemIds = currentItems.map(function (item) {
    return item.getElement().getAttribute('data-id')
  });
  var newItems = [];
  var itemId;
  var itemIndex;

  for (var i = 0; i < layout.length; i++) {
    itemId = layout[i];
    itemIndex = currentItemIds.indexOf(itemId);
    if (itemIndex > -1) {
      newItems.push(currentItems[itemIndex])
    }
  }

  grid.sort(newItems, {layout: 'instant'});
}    

function removeLayout(grid){
  var layout = serializeLayout(grid);
  localStorage.removeItem(layout);
}
  
//function showResults () { 
//  var duration = Math.round((endTime - startTime) / 1000); 
//  var bitsLoaded = downloadSize * 8;
//  var speedBps = Math.round(bitsLoaded / duration);
//  var speedKbps = (speedBps / 1024).toFixed(2);
//  var speedMbps = (speedKbps / 1024).toFixed(2);
//  alert ("Your connection speed is: \n" + speedBps + " bps\n" + speedKbps + " kbps\n" + speedMbps + " Mbps\n")
// }