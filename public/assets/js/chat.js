{
  let username = localStorage.getItem('username');
  let socket;
  if (username) {
    socket = io('/', {query: `saved_user=${username}`});
  } else {
    socket = io();
  }

  document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('m').value;
    socket.emit('chat message', message);
    document.getElementById('m').value = '';
    return false;
  })

  socket.on('chat message', (chat) => {
    const messageList = document.getElementById('messages');
    messageList.innerHTML = '';
    console.log(chat)
    chat.forEach(msg => {
      const usernameElem = document.createElement('div');
      usernameElem.classList.add('message-username');
      usernameElem.style.color = msg.color;
      usernameElem.innerText = msg.username;

      const timestampElem = document.createElement('div');
      timestampElem.classList.add('message-timestamp');
      timestampElem.innerText = msg.timestamp;

      const msgHeader = document.createElement('div');
      msgHeader.classList.add('message-header');
      msgHeader.append(usernameElem);
      msgHeader.append(timestampElem);

      const msgText = document.createElement('div');
      msgText.classList.add('message-body');
      msgText.innerHTML = msg.message;
  
      const msgElem = document.createElement('div');
      msgElem.classList.add('message');
      msgElem.append(msgHeader);
      msgElem.append(msgText);

      const listElem = document.createElement('li');
      listElem.classList.add('message-wrapper');
      if(msg.username === username) {
        listElem.classList.add('you')
      }
      listElem.append(msgElem);

      messageList.append(listElem);
    });
    messageList.scrollTo(0,messageList.scrollHeight);
  })

  socket.on('username', (name) => {
    console.log(name)
    localStorage.setItem('username', name);
    username = name;
  });

  socket.on('users', (users) => {
    console.log(users)
    const userList = document.getElementById('users');
    userList.innerHTML = '';
    for (let i = 0; i < users.length; i++) {
      const listElem = document.createElement('li');
      
      if (users[i] === username) {
        listElem.innerHTML = `${users[i]} (You)`.bold();
        userList.prepend(listElem);
      } else {
        listElem.innerText = users[i];
        userList.append(listElem);
      }
    }
  });

  socket.on('error', (msg) => {
    const errormsg = document.getElementById('input-error-msg');
    errormsg.classList.remove('d-none')
    errormsg.innerText = msg;

    setTimeout( () => {
        errormsg.classList.add('d-none');
        errormsg.innerText = '';
      }, 
      2000
    );
  });
}