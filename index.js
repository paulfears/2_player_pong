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
        this.height = 80;
        this.width = 10;
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
      person.x = 950;
      person.side = "right";
      opponent.side = "left";
      person.opponent = opponent.id;
      opponent.opponent = person.id;
      let ball = new Ball(250, 250, 1+Math.random(), 1+Math.random())
      matches[person.id] = {"person":person, "opponent":opponent, "ball":ball, "disconnected":false };
      matches[opponent.id] = {"person":opponent, "opponent":person, "ball":ball, "disconnected":false };
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

      io.to(match.person.id).emit("startgame", match);
      io.to(match.opponent.id).emit("startgame", match);
      runGame()
    }

    function freshCollision(person, ball){
      if(ball.y >= person.y && ball.y <= person.y+person.height){
        if(person.side === "left"){
          if(ball.x <= person.x+person.width && ball.dx < 0){
            return true;
          }
        }
        if(person.side === "right"){
          if(ball.x >= person.x && ball.dx > 0){
            return true
          }
        }
      }
      return false;
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
      if(freshCollision(match.person, match.ball)){
        match.ball.dx *= -1;
        if(match.ball.dx < 0){
          match.ball.dx -= Math.random();
        }
        else{
          match.ball.dx += Math.random();
        }
      }
      if(freshCollision(match.opponent, match.ball)){
        match.ball.dx *= -1;
        if(match.ball.dx < 0){
          match.ball.dx -= Math.random();
        }
        else{
          match.ball.dx += Math.random();
        }
      }
      
      if(match.ball.x < 0){
        if(match.ball.dx < 0){
          match.ball.dx *= -1;
        }
      }
      if(match.ball.x > 1000){
        if(match.ball.dx > 0){
          match.ball.dx *= -1;
        }
      }
      match.ball.x += match.ball.dx;
      match.ball.y += match.ball.dy;
      io.sockets.to(match.person.id).emit("update", match);
      io.sockets.to(match.opponent.id).emit("update", match);
      if(!match.disconnected){
        setTimeout(runGame, 1000/60);
      }
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


