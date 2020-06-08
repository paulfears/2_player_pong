const socket = io();

let canvas = document.getElementById("playarea");
let ctx = canvas.getContext('2d');



document.addEventListener("touchmove", function(event){
  event.preventDefault();
  socket.emit("setY", event.touches[0].pageY)
}, {passive: false})

document.addEventListener("keydown", function(event){
  if(event.key === 	"ArrowDown"){
    console.log("downArrow pressed")
    socket.emit("moveUp");
  }
  if(event.key == "ArrowUp"){
    console.log("upArrow pressed")
    socket.emit("moveDown");
  }

})

ctx.strokeStyle = "#ffffff"
socket.on('update', function(items){
  ctx.clearRect(0,0,1000,500)
  ctx.fillStyle = "#ff006e";
  ctx.fillRect(0,0, 1000, 500)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(500, 0);
  ctx.lineTo(500, 500);
  ctx.stroke();
  ctx.closePath();
  for(item of Object.values(items)){
    if(item.type === 'player'){
      ctx.fillText(item.id, item.x-10, 15)
      ctx.fillRect(item.x, item.y, item.width, item.height)
    }
    if(item.type === 'ball'){
      ctx.beginPath();
      console.log(item)
      ctx.arc(item.x, item.y, 10, 0, 3.1415*2)
      ctx.fill();
    }
  }
})

socket.on('added_to_queue', function(){
  document.getElementById("queueDialog").style.display = "block";
})

socket.on('exit_queue', function(){
  document.getElementById("queueDialog").style.display = "none";
  readyMenu = document.getElementById("readyMenu")
  console.log(readyMenu)
  readyMenu.style.display = "block";
  document.getElementById("readyButton").addEventListener('click', function(){
    document.getElementById("waitingOnOtherPlayer").style.display = "block";
    document.getElementById("readyButton").style.display = "none";
    socket.emit("ready")
  })
})

socket.on('opponent-ready', function(){

  document.getElementById("opponentReadyAlert").style.display = "block";
})


socket.on('startgame', function(player){
  document.getElementById("readyButton").style.display = "block";
  document.getElementById("readyMenu").style.display = "none";
  document.getElementById("waitingOnOtherPlayer").style.display = "none"
  console.log("here")
  console.log(player)
  console.log(ctx)
  ctx.fillText(player.x, player.y, 20, 40);
})

socket.on('opponentDisconnected', function(){
  alert("opponent disconnected")
})