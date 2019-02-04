const URL = 'wss://traze.iteratec.de:9443';
const TILES = -1;
const GRID_SIZE = 61;
const CLIENT_ID = pickNewID();
const CLIENT = mqtt.connect(URL, {clientId: CLIENT_ID});

const JOIN_TOPIC = "traze/1/join";

const TOPIC_TO_FUNCTION = {
    'traze/1/players': onPlayers,
    'traze/1/grid': onGrid,
    ['traze/1/player/' + CLIENT_ID]: onMyPlayer,
    'traze/1/ticker': onTicker
};

let playerId, secretToken, steerTopic, bailTopic, playerCount, deadId;

let id_to_color = {0: 'BLACK'};

CLIENT.on('connect', function () {
    let topics = Object.keys(TOPIC_TO_FUNCTION);
    CLIENT.subscribe(topics, function (err) {
        if (err) {
            console.log(err);
        }
    });
});

function onPlayers(message) {
    spielerAnzahl = message.length;
    for (let i = 0; i < spielerAnzahl; i++) {
        playerCount = i;
    }
    playerInformation(message);
}

function onMyPlayer(message) {
    secretToken = message.secretUserToken;
    playerId = message.id;
    steerTopic = 'traze/1/' + playerId + '/steer';
    bailTopic = 'traze/1/' + playerId + '/bail';
    // playerInformation(message);
    return message;
}

function onGrid(message) {
    drawPlayer(message);
    paintSpawnPoint(message);
}

function onTicker(message) {
    deadId = message.casualty;
    toderkennen();
}

CLIENT.on('message', function (topic, message) {
    message = JSON.parse(message);
    TOPIC_TO_FUNCTION[topic](message);
});

function drawPlayer(gridMessage) {
    for (let x = 0; x < gridMessage.tiles.length; x++) {
        for (let y = 0; y < gridMessage.tiles.length; y++) {
            let playerId = gridMessage.tiles[x][y];
            let cell = document.getElementById(x + "-" + y);

            if (cell.classList.contains("blink")) {
                cell.classList.remove("blink");
            }
            if (cell) {
                cell.style.background = id_to_color[playerId];
            }
            else {
                console.error("cell " + x + "-" + y + " not found");
            }

        }

    }
}

function paintSpawnPoint(gridMessage) {
    let spawnPoints = gridMessage.spawns;
    for (let i = 0; i < gridMessage.spawns.length; i++) {
        let cell = document.getElementById(spawnPoints[i][0] + "-" + spawnPoints[i][1]);
        cell.classList.add("blink");
    }
}

function playerInformation(message) {
    document.getElementById('tf1').innerText = '';
    document.getElementById('tf2').innerText = '';

    for (player of message) {
        document.getElementById('tf1').innerText += player.name + '\n';
        document.getElementById('tf2').innerText += player.frags + '\n';

        id_to_color[player.id] = player.color;
    }
}


function joinGame() {
    let playerName = document.getElementById("playerNameInput").value;

    let joinMsg = {
        name: playerName,
        mqttClientName: CLIENT_ID
    };

    CLIENT.publish(JOIN_TOPIC, JSON.stringify(joinMsg));

    registerKeyboardInputs();
}

function toderkennen() {
    if (deadId == playerId) {
        document.removeEventListener('keydown', eventListener);
    }

}

function test() {
    console.log("TOPIC_TO_FUNCTION",TOPIC_TO_FUNCTION);
    console.log("playerId",playerId);

}
function steuern(richtung) {
    let steuernMessage = {course: richtung, playerToken: secretToken};
    CLIENT.publish(steerTopic, JSON.stringify(steuernMessage));

}
function registerKeyboardInputs() {
    document.addEventListener('keydown', eventListener);
}

function eventListener(event) {

    if (event.keyCode == '87') {
        steuern('N');
    }
    // A
    else if (event.keyCode == '65') {
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
}

function selbstmordBot() {
    let selbstmordBotName = "SelbstmordBot";

   let clientId = pickNewID();

    let joinMsg = {
        name: selbstmordBotName,
        mqttClientName: CLIENT_ID
    };

    CLIENT.publish(JOIN_TOPIC, JSON.stringify(joinMsg));

    setTimeout(function() {
        steuern('E');
    }, 1000);
}

function leave() {
    let bailMessage = {playerToken: secretToken};
    CLIENT.publish(bailTopic, JSON.stringify(bailMessage));
}

function pickNewID() {
    let d = new Date().getTime();
    if (Date.now) {
        d = Date.now();
    }
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function showGrid() {
    let spielfeld = document.getElementById("Spielfeld");
    let div = document.getElementsByTagName("span");
    for (let j = GRID_SIZE; j > TILES; j--) {
        let row = document.createElement("div");
        for (let i = GRID_SIZE; i > TILES; i--) {
            let cell = document.createElement("span");
            cell.id = "" + i + "-" + j;
            row.appendChild(cell);
        }
        spielfeld.appendChild(row);
    }
}