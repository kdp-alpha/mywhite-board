let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColorCont = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");

let pencilcolor = "red";
let pencilWidth = pencilWidthElem.value;

let eraserWidthElem = document.querySelector(".eraser-width");
let eraserWidth = eraserWidthElem.value;
let erase = false;
let eraserColor = null;

let undoRedoTracker = [];
let track = 0;
let undo = document.querySelector(".undo");
let redo = document.querySelector(".redo");



let download = document.querySelector(".download");

let Bin = document.querySelector(".bin")

let tool = canvas.getContext("2d");
tool.strokeStyle = pencilcolor;
tool.strokeStyle = pencilWidth;
let ix, iy, fx, fy;

let drawingTool = false;
// tool.beginPath();
// tool.moveTo(10,10)
// tool.lineTo(100,150)
// tool.stroke()

canvas.addEventListener("mousedown", (e) => {
  drawingTool = true;
  ix = e.clientX;
  iy = e.clientY;
  let data = {
    x: e.clientX,
    y: e.clientY,
  }
  socket.emit("beginPath", data)

});
canvas.addEventListener("mousemove", (e) => {

  fx = e.clientX;
  fy = e.clientY;

  if (drawingTool == false) {
    return;
  }
  if (erase) {
    // tool.clearRect(fx, fy, eraserWidth, eraserWidth);
    let data = {
      finalX : fx,
      finalY : fy,
      eraserWidth,
      eraserWidth

    }
    socket.emit("erasingThing",data);
  } else {
    // erase = false;
    if (drawingTool) {
      let data = {
        x: e.clientX,
        y: e.clientY,
        color: erase ? eraserColor : pencilcolor,
        width: erase ? eraserWidth : pencilWidth,

      }
      socket.emit("drawStroke",data); 
    }
   
  }
});

function erasingThing(strokeObj)
{
  tool.clearRect(strokeObj.finalX, strokeObj.finalY, strokeObj.eraserWidth, strokeObj.eraserWidth);
}

canvas.addEventListener("mouseup", (e) => {
  drawingTool = false;
  let url = canvas.toDataURL();
  undoRedoTracker.push(url);
  track = undoRedoTracker.length - 1;
});

function beginPath(strokeObj) {
  tool.beginPath();
  tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj) {
  tool.strokeStyle = strokeObj.color;
  tool.lineWidth = strokeObj.width;
  tool.lineTo(strokeObj.x, strokeObj.y);
  tool.stroke();
}

pencilColorCont.forEach((Allcolors) => {
  Allcolors.addEventListener("click", (e) => {
    let currentColor = Allcolors.classList[0];
    pencilcolor = currentColor;
    tool.strokeStyle = pencilcolor;
  });
});

pencilWidthElem.addEventListener("change", (e) => {
  pencilWidth = pencilWidthElem.value;
  tool.lineWidth = pencilWidth;
});

eraser.addEventListener("click", (e) => {
  erase = !erase;
});
eraserWidthElem.addEventListener("change", (e) => {
  eraserWidth = eraserWidthElem.value;
  tool.lineWidth = eraserWidth;
});

download.addEventListener("click", (e) => {
  let url = canvas.toDataURL();

  let a = document.createElement("a");
  a.href = url;
  a.download = "board.jpg";
  a.click();
});

undo.addEventListener("click", (e) => {
  if (track > 0) track--;
  // track action
  let data = {
    trackValue: track,
    undoRedoTracker,
  };
  socket.emit("redoUndo",data)
});
redo.addEventListener("click", (e) => {
  if (track < undoRedoTracker.length - 1) track++;
  // track action
  let data = {
    trackValue: track,
    undoRedoTracker,
  };
  socket.emit("redoUndo",data)
});

function undoRedoCanvas(trackObj) {
  track = trackObj.trackValue;
  undoRedoTracker = trackObj.undoRedoTracker;
  tool.clearRect(0, 0, canvas.width, canvas.height);
  let url = undoRedoTracker[track];
  let image = new Image(); //new image
  image.src = url;
  image.onload = (e) => {
    tool.drawImage(image, 0, 0, canvas.width, canvas.height);
  };
}
Bin.addEventListener("click", () =>{
  data = {
      track,
      undoRedoTracker
  }
  socket.emit("clearAll", data);

})

function clearAll(data)
{
  track++;
  tool.clearRect(0, 0, canvas.width, canvas.height);
}





socket.on("beginPath",(data)=>{
  //data from server
  beginPath(data)
})

socket.on("drawStroke",(data)=>{
  drawStroke(data);
})
socket.on("redoUndo",(data)=>{
 undoRedoCanvas(data)
})
socket.on("erasingThing",(data)=>{
  erasingThing(data);
})
socket.on("clearAll", (data)=>{
  clearAll(data);
})