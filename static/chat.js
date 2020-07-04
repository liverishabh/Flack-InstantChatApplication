document.addEventListener('DOMContentLoaded', () => {
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    
    var storage = window.localStorage;

    if(storage.getItem("username")){    
        document.querySelector('#createchannel_button').innerHTML = "Create new channel";
        document.querySelector('#welcome_user').innerHTML = "Welocme, "+storage.getItem("username")+" !";
        document.querySelector("#logout").innerHTML = "Logout";
    }

    socket.on('connect', () => {
        if(!storage.getItem("username")){
            document.querySelector("#chat_page").style.display = "none";
        }else{
            document.querySelector("#login_page").style.display = "none";
        }
    });

    socket.on('alert', message => {
        alert(message);
    });

    document.querySelector("#login_form").onsubmit = () => {
        
        const username = document.querySelector("#username");

        if(username.value.length < 3){
            alert("Username must be at least 3 characters long!");
            return false;
        }

        socket.emit("login", username.value);
        return false;
    };

    socket.on("login", username => {
        storage.setItem("username", username);
        document.querySelector("#login_page").style.display = "none";
        document.querySelector("#chat_page").style.display = "block";
        document.querySelector('#createchannel_button').innerHTML = "Create new channel";
        document.querySelector('#welcome_user').innerHTML = "Welocme, "+storage.getItem("username")+" !";
        document.querySelector("#logout").innerHTML = "Logout";
    });

    document.querySelector('#createchannel').onsubmit = () => {           
        const channelname = document.querySelector('#channelname').value;

        if(channelname.length < 3){
            alert("Channel name must be at least 3 characters long!");
            document.querySelector('#channelname').focus();
            return false;
        }
        socket.emit('create channel', channelname);
        document.querySelector('#channelname').value = "";
        $("#myModal").modal('hide');
        return false;
    };

    socket.on('channel created', channelname => {
        const li = document.createElement('li');
        li.innerHTML = `<buttton class="btn btn-link" data-channel="${channelname}">#${channelname}</button>`;
        document.querySelector('#channel_list').append(li);
        const hr = document.createElement('hr');
        document.querySelector('#channel_list').append(hr);
        buttons = document.querySelectorAll('.btn-link');
        buttons.forEach(button => {
            button.onclick = () => {
                const channelname = button.dataset.channel;
                const username = storage.getItem("username");
                socket.emit('join channel', channelname, username);
            }            
        });
    });

    document.querySelectorAll('.btn-link').forEach(button => {
        button.onclick = () => {
            const channelname = button.dataset.channel;
            const username = storage.getItem("username");
            socket.emit('join channel', channelname, username);
        }
    });

    socket.on('channel joined', data => {        
        storage.setItem("current channel", data.channelname);
        alert(`You have joined the channel: #${data.channelname}`);
        document.querySelector("#chat_msg_header").innerHTML = data.channelname;

        var content = document.querySelector('#messages');
        while (content.hasChildNodes()) {  
            content.removeChild(content.firstChild);
        }

        const messages = data.messages[data.channelname];
        console.log(messages);
        if(typeof messages !== 'undefined'){
            for (var i=0; i<messages.length; i++){
                let username = messages[i][0];
                let date = messages[i][1];
                let time = messages[i][2];
                let message = messages[i][3];
    
                let div = document.createElement('div');
                if(username === storage.getItem("username")){
                    div.innerHTML = `<div class="jumbotron jumbotron4"><strong> ${username}: </strong> <div> ${message} </div> <small> ${date} ${time} </small>`;
                }else{
                    div.innerHTML = `<div class="jumbotron jumbotron5"><strong> ${username}: </strong> <div> ${message} </div> <small> ${date} ${time} </small>`;
                }
                document.querySelector('#messages').append(div);
    
            }
        }

        // for (data in messages){
        //     let username = data[0];
        //     let date = data[1];
        //     let time = data[2];
        //     let message = data[3];

        //     let div = document.createElement('div');
        //     if(username === storage.getItem("username")){
        //         div.innerHTML = `<div class="jumbotron jumbotron4"><strong> ${username}: </strong> <div> ${message} </div> <small> ${date} ${time} </small>`;
        //     }else{
        //         div.innerHTML = `<div class="jumbotron jumbotron5"><strong> ${username}: </strong> <div> ${message} </div> <small> ${date} ${time} </small>`;
        //     }
        //     document.querySelector('#messages').append(div);
        // }

    });

    document.querySelector('#message_submit').onsubmit = () => {
        const channelname = storage.getItem("current channel");
        const username = storage.getItem("username");
        const message = document.querySelector('#message_input').value;

        const d = new Date();

        const time = d.toLocaleTimeString();
        var date = d.toDateString();
        date = date.slice(4,date.length);

        socket.emit('send message', channelname, username, message, date, time);
        document.querySelector('#message_input').value = "";
        // console.log("Hi");
        return false;
    };

    socket.on('receive message', received => {
        const channelname = received.channelname;
        const data = received.data;
        const username = data[0];
        const date = data[1];
        const time = data[2];
        const message = data[3];
        //console.log("Hi");

        if(channelname === storage.getItem("current channel")){
            const div = document.createElement('div');
            if(username === storage.getItem("username")){
                div.innerHTML = `<div class="jumbotron jumbotron4"><strong> ${username}: </strong> <div> ${message} </div> <small> ${date} ${time} </small>`;
            }else{
                div.innerHTML = `<div class="jumbotron jumbotron5"><strong> ${username}: </strong> <div> ${message} </div> <small> ${date} ${time} </small>`;
            }
            document.querySelector('#messages').append(div);
            // const li = document.createElement('li');
            // li.innerHTML = `${username} says "${message}" on ${date} at ${time}`;
            // document.querySelector('#msg').append(li);
        }
    });


});
