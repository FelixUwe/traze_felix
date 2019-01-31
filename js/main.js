const url = 'wss://traze.iteratec.de:9443';
const tiles = 62;
const clientId = pickNewID();
let playerId = '';

const topics = [
    'traze/1/players',
    'traze/1/grid',
    'traze/1/join',
    'traze/1/player/' + clientId
];


let client = mqtt.connect(url, {clientId: clientId});
let testMessage = '';

let playerMessage = '';
let tickerMessage = '';
let gridMessage = {};

let secretToken = '';
let steerTopic = '';
let bailTopic = '';

let i = '';
let j = '';

let id_to_color = {};
let id_to_position = {};

let cell = '';

let spielerFarben = {};
let playerCount = '';

client.on('connect', function () {
    client.subscribe(topics, function (err) {
        if (err) {
            console.log(err);
        }
    });
});

client.on('message', function (topic, message) {
    if (topic === topics[3]) {
        message = JSON.parse(message);
        console.log(message);
        secretToken = message.secretUserToken;
        playerId = message.id;
        steerTopic = 'traze/1/' + playerId + '/steer';
        bailTopic = 'traze/1/' + playerId + '/bail';
        console.log(playerId);


        playerInformation();
    }

    if (topic === topics[0]) {
        playerMessage = JSON.parse(message);
        spielerAnzahl = playerMessage.length;
        // console.log(spielerAnzahl);
        for (i = 0; i < spielerAnzahl; i++) {
            playerCount = i;
            // console.log(playerCount);
        }
        playerInformation();
        message = JSON.parse(message);
    }
    if (topic === topics[1]) {
        gridMessage = JSON.parse(message);
        drawPlayer(gridMessage);
        //console.log(gridMessage);

        // gridErstellen(gridMessage);
        // console.log(gridMessage.bikes[0].currentLocation);
        // let position = gridMessage.bikes[0].currentLocation;
        // console.log(position);
        //
        // for (player of playerMessage) {
        // console.log(playerMessage[0].color);
        //     let player = gridMessage.bikes;
        //     // console.log(player);
        // }

    }


});

function drawPlayer(gridMessage) {
    for (let x = 0; x < gridMessage.tiles.length; x++) {
        for (let y = 0; y < gridMessage.tiles.length; y++) {
             playerId = gridMessage.tiles[x][y];
            cell = document.getElementById(x+"-"+y);
            if(cell)
            {
                cell.style.background = id_to_color[playerId];
            }
            else {
                console.log("cell " + x + "-" + y + " not found");
            }
        }
        //wenn currentLocation != auf dem Spielfeld Spieler nicht anzeigen o. wenn id = 0 zeige farbe schwarz an
        
    }
}

function Farben(message) {
    message.forEach(player => {
        spielerFarben[playerId] = player.color;
    })
}

function playerInformation(){
    document.getElementById('tf1').innerText = '';
    document.getElementById('tf2').innerText = '';

    for (player of playerMessage) {
        document.getElementById('tf1').innerText += player.name + '\n';
        document.getElementById('tf2').innerText += player.frags + '\n';

        // map player id to color every 5 seconds (on player topic)
        id_to_color[player.id] = player.color;
    }

    // document.getElementById('feld2').innerHTML = tickerMessage;
    // document.getElementById('feld3').innerHTML = gridMessage;

    //console.log(playerMessage);
    // document.getElementById('feld1').innerHTML = playerInformation;
}


function joinGame() {
    let playerName = document.getElementById("playerNameInput").value;

    let joinMsg = {
        name: playerName,
        mqttClientName: clientId
    };

    steuerInput();

    client.publish(topics[2], JSON.stringify(joinMsg));
    console.log(topics[2]);
    //
}

function test() {
    console.log(topics);
    playerInformation();
    console.log(playerId);
    console.log(playerMessage);
    console.log(gridMessage);
    console.log(cell);

}

function steuern(richtung) {
    let steuernMessage = {course: richtung, playerToken: secretToken };
    // console.log(steerTopic, JSON.stringify(steuernMessage));
    client.publish(steerTopic, JSON.stringify(steuernMessage));
}

function steuerInput() {
    document.addEventListener('keydown', event => {
        event = event || window.event;
        // W
       if (event.keyCode == '87'){
            steuern('N');
       }
       // A
       else if (event.keyCode == '65'){
           steuern('W');
        }
        // S
        else if (event.keyCode == '83') {
            steuern('S');
        }
        // D
        else if (event.keyCode == '68') {
            steuern('E');
        }
    });
}

function rechtsSteuern() {
    steuern('E');
};

function obenSteuern() {
    steuern('N');
};

function linksSteuern() {
    steuern('W');
};

function untenSteuern() {
    steuern('S');
};


function leave() {
    let bailMessage = {playerToken : secretToken};
    console.log(bailTopic);
    console.log(bailMessage);
    client.publish(bailTopic, JSON.stringify(bailMessage));
}

function pickNewID() {
    let d = new Date().getTime();
    if(Date.now){
        d = Date.now(); //high-precision timer
    }
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;

}

function showGrid() {

    let spielfeld = document.getElementById("Spielfeld");
    let div = document.getElementsByTagName("span");
    // let div2 = document.getElementsByTagName("span");

    // console.log(gridMessage);
    for ( i = 0; i < tiles; i++) {
        // div.id
        let row = document.createElement("div");
        for ( j = 0; j < tiles; j++) {
            let cell = document.createElement("span");
            cell.id = "" + i + "-" + j;
            row.appendChild(cell);
        }
        spielfeld.appendChild(row);
    }
}