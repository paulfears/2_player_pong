const socket = io();

let canvas = document.getElementById("playarea");
let ctx = canvas.getContext('2d');

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


socket.on('update', function(items){
  ctx.clearRect(0,0,450,500)
  ctx.clearRect(550, 0, 450, 500)
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
document.getElementById("queueDialog").style.display = "block";
socket.on('added_to_queue', function(){
  console.log("added to queue");
})

socket.on('exit_queue', function(){
  document.getElementById("queueDialog").style.display = "none";
  readyMenu = document.getElementById("readyMenu")
  console.log(readyMenu)
  readyMenu.style.display = "block";
  document.getElementById("readyButton").addEventListener('click', function(){
    
    socket.emit("ready")
  })
})

socket.on('opponent-ready', function(){
  document.getElementById("opponentReadyAlert").style.display = "block";
})


socket.on('startgame', function(player){
  document.getElementById("readyMenu").style.display = "none";
  console.log("here")
  console.log(player)
  console.log(ctx)
  ctx.fillText(player.x, player.y, 20, 40);
})