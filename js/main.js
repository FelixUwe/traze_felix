const url = 'wss://traze.iteratec.de:9443';
const tiles = -1;
const clientId = pickNewID();
let playerId = '';

const topics = [
    'traze/1/players',
    'traze/1/grid',
    'traze/1/join',
    'traze/1/player/' + clientId,
    'traze/1/ticker'
];


let client = mqtt.connect(url, {clientId: clientId});
let testMessage = '';

let playerMessage = '';
let tickerMessage = '';
let gridMessage = {};

let secretToken = '';
let steerTopic = '';
let bailTopic = '';

let id_to_color = {0: 'BLACK'};

// let topics = { KEY : VALUE};
// topics

let id_to_position = {};

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
        secretToken = message.secretUserToken;
        playerId = message.id;
        steerTopic = 'traze/1/' + playerId + '/steer';
        bailTopic = 'traze/1/' + playerId + '/bail';
        playerInformation();
    }

    if (topic === topics[0]) {
        playerMessage = JSON.parse(message);
        spielerAnzahl = playerMessage.length;
        for (let i = 0; i < spielerAnzahl; i++) {
            playerCount = i;
            // console.log(playerCount);
        }
        playerInformation();
        message = JSON.parse(message);
    }
    if (topic === topics[1]) {
        gridMessage = JSON.parse(message);
        drawPlayer(gridMessage);
        paintSpawnPoint(gridMessage);
    }
    if (topic === topics[4]) {
        tickerMessage = JSON.parse(message);
    }


});

function drawPlayer(gridMessage) {
    for (let x = 0; x < gridMessage.tiles.length; x++) {
        for (let y = 0; y < gridMessage.tiles.length; y++) {
            let playerId = gridMessage.tiles[x][y];
            let cell = document.getElementById(x+"-"+y);

            if (cell.classList.contains("blink")) {
                cell.classList.remove("blink");
            }
            if(cell) {
                cell.style.background = id_to_color[playerId];
            }
            else {
                console.log("cell " + x + "-" + y + " not found");
            }

        }
        
    }
}

function paintTrailWhenKilled(deadTrail) {
    for (let i = 0; i < deadTrail.length; i++) {
        let cell = document.getElementById(deadTrail[i][0] + "-" + deadTrail[i][1]);
        cell.style.background = "white";
    }
}

function paintSpawnPoint(gridMessage) {
    let spawnPoints = gridMessage.spawns;
    for (let i = 0;i < gridMessage.spawns.length; i++) {
        let cell = document.getElementById(spawnPoints[i][0] + "-" + spawnPoints[i][1]);
        cell.classList.add("blink");
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

        id_to_color[player.id] = player.color;
    }


}


function joinGame() {
    let playerName = document.getElementById("playerNameInput").value;

    let joinMsg = {
        name: playerName,
        mqttClientName: clientId
    };

    steuerInput();

    client.publish(topics[2], JSON.stringify(joinMsg));
    //
}

function test() {
    console.log(topics);
    playerInformation();
    console.log(playerId);
    console.log(playerMessage);
    console.log(gridMessage);
    console.log(cell);
    console.log(logCell);

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

// function selbstmordBot() {
//    let selbstmordBotName = SelbstmordBot;
//
//    let clientId = pickNewID();
//
//    let joinMsg = {
//         name: playerName,
//         mqttClientName: clientId
//     };
//
//    rechtsSteuern();
//
// }

function rechtsSteuern() {
    steuern('E');
}

function obenSteuern() {
    steuern('N');
}

function linksSteuern() {
    steuern('W');
}

function untenSteuern() {
    steuern('S');
}


function leave() {
    let bailMessage = {playerToken : secretToken};
    client.publish(bailTopic, JSON.stringify(bailMessage));
}

function pickNewID() {
    let d = new Date().getTime();
    if(Date.now){
        d = Date.now();
    }
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c==='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;

}

function showGrid() {

    let spielfeld = document.getElementById("Spielfeld");
    let div = document.getElementsByTagName("span");
    for (let j = 61; j > tiles; j--) {
        let row = document.createElement("div");
        for (let i = 61; i > tiles; i--) {
            let cell = document.createElement("span");
            cell.id = "" + i + "-" + j;
            row.appendChild(cell);
        }
        spielfeld.appendChild(row);
    }
}