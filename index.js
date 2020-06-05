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
        this.ready = false;
        this.type = "player";
    }
    moveup(){
      this.y += 1;
    }
    movedown(){
      this.y -= 1;
    }
}

class Ball{
  constructor(x, y, dx, dy){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.type = "ball";
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
      io.to(person.id).emit("added_to_queue")
      unmatched_players.push(person);
    }
    else{
      let opponent = unmatched_players.shift() //pops player out of queue
      if(opponent.id === person.id){
        unmatched_players.push(person)
        return;
      }
      io.to(opponent.id).emit("exit_queue")
      io.to(person.id).emit("exit_queue")
      person.x = 450;
      person.side = "right";
      opponent.side = "left";
      person.opponent = opponent.id;
      opponent.opponent = person.id;
      let ball = new Ball(250, 250, 1+Math.random(), 1+Math.random())
      matches[person.id] = {"person":person, "opponent":opponent, "ball":ball };
      matches[opponent.id] = {"person":opponent, "opponent":person, "ball":ball };
      console.log("person id is "+person.id)
      
    }

    function everybodyReady(){
      let match = matches[person.id]
      let opponent = match.opponent
      if(person.ready && opponent.ready){
        startGame(person.id)
      }
      else{
        io.to(opponent.id).emit("opponent-ready");
      }
    }

    function startGame(id){
      let match = matches[socket.id]
      console.log(socket.id)
      console.log(matches)

      io.to(match.person.id).emit("startgame", match);
      io.to(match.opponent.id).emit("startgame", match);
      setInterval(runGame, 1000/60)
    }
    function runGame(){
      let match = matches[socket.id]
      if(match.ball.y < 0){
        if(match.ball.dy < 0){
          match.ball.dy *= -1;
        }
      }
      if(match.ball.y > 500){
        if(match.ball.dy > 0){
          match.ball.dy *= -1;
        }
      }
      if(match.ball.y >= match.person.y && match.ball.y <= match.person.y+40){
        if(person.side == "left"){
          if(match.ball.x < match.person.x && match.ball.dx < 0){
            match.ball.dx *=-1
          }
        }
      }
      if(match.ball.y >= match.opponent.y && match.ball.y <= match.opponent.y+40){
        if(match.ball.x > match.opponent.x && match.ball.dx > 0){
          match.ball.dx *=-1
        }
      }
      match.ball.x += match.ball.dx;
      match.ball.y += match.ball.dy;
      io.sockets.to(match.person.id).emit("update", match);
      io.sockets.to(match.opponent.id).emit("update", match);
    }


    socket.on('disconnect', function(){
      if(unmatched_players.indexOf(person) != -1){
        console.log("here")
        unmatched_players.splice(unmatched_players.indexOf(person), 1)
      }
    });

    socket.on('ready', function(){
      person.ready = true;
      everybodyReady();
    })

    socket.on('moveUp', function(){
      if(matches[socket.id]){
        matches[socket.id].person.y += 8;
      }
    })
    socket.on('moveDown', function(){
      if(matches[socket.id]){
        matches[socket.id].person.y -= 8;
      }
    })



})


