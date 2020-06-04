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


socket.on('update', function(players){
  ctx.clearRect(0,0,500,500)
  for(player of Object.values(players)){
    ctx.fillText(player.id, player.x-10, 15)
    ctx.fillRect(player.x, player.y, 20, 40)
  }
})


socket.on('startgame', function(player){
  console.log("here")
  console.log(player)
  console.log(ctx)
  ctx.fillText(player.x, player.y, 20, 40);
})