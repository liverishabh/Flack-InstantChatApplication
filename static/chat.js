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

    socket.on('channel joined', channelname => {        
        storage.setItem("current channel", channelname);
        alert(`You have joined the channel: #${channelname}`);
        document.querySelector("#chat_msg_header").innerHTML = channelname;
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
        console.log("Hi");

        if(channelname === storage.getItem("current channel")){
            const li = document.createElement('li');
            li.innerHTML = `${username} says "${message}" on ${date} at ${time}`;
            document.querySelector('#msg').append(li);
        }
    });


});
