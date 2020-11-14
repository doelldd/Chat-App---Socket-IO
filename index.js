var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var faker = require('faker');

let messages = [];
let usernames = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('saved user: ' + socket.handshake.query['saved_user']);
  const savedUser = socket.handshake.query['saved_user'];

  if (!savedUser) {
    const randomUsername = faker.fake("{{random.word}}{{random.number}}");
    console.log(randomUsername)
    usernames[randomUsername] = randomUsername;
    socket.username = randomUsername;
    socket.color = "black";
  } else {
    usernames[savedUser] = savedUser;
    socket.username = savedUser;
    socket.color = "black";
    messages.map(x => {
      if (x.username === socket.username) {
        x.color = "black";
      }
    });
  }

  console.log(usernames)
  socket.emit('username', socket.username);
  io.emit('users', Object.values(usernames));
  socket.emit('chat message', messages);


  socket.on('chat message', function(msg) {
    // change username
    if(msg.startsWith('/name')) {
      const newUsername = msg.slice(6);
      if (!Object.values(usernames).includes(newUsername)) {
        delete usernames[socket.username];
        usernames[newUsername] = newUsername;

        messages.map(x => {
          if (x.username === socket.username) {
            x.username = newUsername;
          }
        });

        socket.username = newUsername;
        socket.emit('username', newUsername);
        io.emit('users', Object.values(usernames));
        io.emit('chat message', messages);
      } else {
        console.log('name already exists')
      }
      return;
    }

    // change display color
    if(msg.startsWith('/color')) {
      const newColor = msg.slice(7);
      socket.color = newColor;
      messages.map(x => {
        if (x.username === socket.username) {
          x.color = socket.color;
        }
      });
      io.emit('chat message', messages);
      return
    }



    const date = new Date();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timestamp = hours + ':' + minutes;

    if (messages.length === 200) {
      messages.shift();
    }

    // Emoji replacements
    msg = msg.replace(/\:\)/g, '&#x1f601;')
    msg = msg.replace(/\:\(/g, '&#x1F641;')
    msg = msg.replace(/\:\o/g, '&#x1F632;')

    messages.push({message: msg, username: socket.username, color: socket.color, timestamp});

    // io.emit('chat message', {message: msg, username: socket.username, color: socket.color, timestamp});
    io.emit('chat message', messages);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete usernames[socket.username];
    socket.broadcast.emit('users', Object.values(usernames));
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});