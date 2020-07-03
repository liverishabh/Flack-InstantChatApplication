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
        // li.innerHTML= `#${channelname}`;
        document.querySelector('#channel_list').append(li);
        const hr = document.createElement('hr');
        document.querySelector('#channel_list').append(hr);
    });

    document.querySelectorAll('button.btn-link').forEach(button => {
        button.onclick = () => {
            const channelname = button.dataset.channel;
            const username = storage.getItem("username");
            socket.emit('join channel', channelname, username);
        };
    });

    socket.on('channel joined', channelname => {        
        storage.setItem("current channel", channelname);
        alert(`You have joined the channel: #${channelname}`);
    });


});
