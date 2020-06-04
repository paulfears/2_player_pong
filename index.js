const express = require('express')

const http = require('http')

const app = express()

const server = http.Server(app);

app.use('/', express.static(__dirname+"/pages/index"))

server.listen(3000)

const io = require('socket.io')(server);

class Player{
    constructor(x,y, socketid){
        this.x = x;
        this.y = y;
        this.id = socketid;
    }
    moveup(){
      this.y += 1;
    }
    movedown(){
      this.y -= 1;
    }
}


let players = {};
let unmatched_players = []
let matches = {}
io.on('connection', (socket)=>{
    console.log("connection")
    let person = new Player(10, 10, socket.id)
    players[socket.id] = person;
    let pair = []
    if(unmatched_players.length == 0){
      unmatched_players.push(person);
    }
    else{
      let opponent = unmatched_players.shift() //pops player out of queue
      person.x = 450;
      person.opponent = opponent.id;
      opponent.opponent = person.id;
      matches[person.id] = [person, opponent];
      matches[opponent.id] = [opponent, person];
      console.log("person id is "+person.id)
      startGame(person.id);
    }

    function startGame(id){
      let pair = matches[socket.id]
      console.log(socket.id)
      console.log(matches)

      io.to(pair[0].id).emit("startgame", pair);
      io.to(pair[1].id).emit("startgame", pair);
      setInterval(runGame, 1000/60)
    }
    function runGame(){
      let pair = matches[socket.id]
      io.sockets.to(pair[0].id).emit("update", pair);
      io.sockets.to(pair[1].id).emit("update", pair);
    }

    socket.on('moveUp', function(){
      if(matches[socket.id]){
        matches[socket.id][0].y += 10;
      }
    })
    socket.on('moveDown', function(){
      if(matches[socket.id]){
        matches[socket.id][0].y -= 10;
      }
    })



})


