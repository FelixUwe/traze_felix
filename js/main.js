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

let botMode = false;

let x = '';

let aktuellerBotBike = '';

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

    console.log("set id to ", playerId);

    steerTopic = 'traze/1/' + playerId + '/steer';
    bailTopic = 'traze/1/' + playerId + '/bail';
    // playerInformation(message);
    return message;
}

function onGrid(message) {
    drawPlayer(message);
    paintSpawnPoint(message);

    if (botMode) {
        if (aktuellerBotBike === '') {
            setBotBike(message)
        } else {
            botSteuernRechtsWennRechtsFrei(message);
        }
    }
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
            } else {
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
    botMode = false;

    let playerName = document.getElementById("playerNameInput").value;
    let joinMsg = {
        name: playerName,
        mqttClientName: CLIENT_ID
    };

    CLIENT.publish(JOIN_TOPIC, JSON.stringify(joinMsg));

    registerKeyboardInputs();
}

function toderkennen() {

    let steerButtonList = document.getElementsByClassName("steer-button");

    let index = '';

    if (deadId == playerId) {
        document.removeEventListener('keydown', eventListener);
        for (let index = 0; index < steerButtonList.length; index++) {
            let steerButton = steerButtonList[index];
            if (steerButton.classList.contains("deaktiviert")) {
                steerButton.removeAttribute("disabled");
                steerButton.classList.remove("deaktiviert");
            }
        }
        botMode = false;
    }

}

function test() {
    console.log("TOPIC_TO_FUNCTION", TOPIC_TO_FUNCTION);
    console.log("playerId", playerId);

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

    let steerButtonList = document.getElementsByClassName("steer-button");

    for (let index = 0; index < steerButtonList.length; index++) {
        let steerButton = steerButtonList[index];
        steerButton.classList.add("deaktiviert");
        steerButton.setAttribute("disabled", "disabled");
    }

    let joinMsg = {
        name: selbstmordBotName,
        mqttClientName: CLIENT_ID
    };

    CLIENT.publish(JOIN_TOPIC, JSON.stringify(joinMsg));
    setTimeout(function () {
        steuern('E');
    }, 1000);

}

function disableSteerButtons() {
    let steerButtonList = document.getElementsByClassName("steer-button");

    for (let index = 0; index < steerButtonList.length; index++) {
        let steerButton = steerButtonList[index];
        steerButton.classList.add("deaktiviert");
        steerButton.setAttribute("disabled", "disabled");
    }
}

function bot() {
    let botName = "Superbot";
    disableSteerButtons();

    let joinMsg = {
        name: botName,
        mqttClientName: CLIENT_ID
    };

    CLIENT.publish(JOIN_TOPIC, JSON.stringify(joinMsg));

    setTimeout(function () {
        botMode = true;
        steuern('N');
    }, 1000);
}

function setBotBike(message) {
    for (let x = 0; x < message.bikes.length; x++) {
        if (playerId === message.bikes[x].playerId) {
            aktuellerBotBike = message.bikes[x];
        }
    }
    console.log("aktuellerBotBike", aktuellerBotBike);
}

function botSteuernRechtsWennRechtsFrei(message) {
    let newX = aktuellerBotBike.currentLocation[0] + 1;
    let naechstePositionRechts = "" + newX + "-" + aktuellerBotBike.currentLocation[1];
    if (naechstePositionRechts === document.getElementById(naechstePositionRechts).id && document.getElementById(naechstePositionRechts).style.background === "black none repeat scroll 0% 0%") {
        console.log("RECHTS FREI");
        steuern('E');
    } else {
        console.log("RECHTS nicht FREI");
        botSteuernUntenWennUntenFrei(message);
    }
}

function botSteuernLinksWennLinksFrei(message) {
    let newNegativX =  aktuellerBotBike.currentLocation[0] - 1;
    let naechstePositionLinks = "" + newNegativX + "" + aktuellerBotBike.currentLocation[1];

    if (naechstePositionLinks === document.getElementById(naechstePositionLinks).id && document.getElementById(naechstePositionLinks).style.background === "black none repeat scroll 0% 0%") {
        console.log("Links FREI");
        steuern('W');
    } else {
        console.log("Links NICHT FREI");
        botSteuernObenWennObenFrei(message);
    }
}

function botSteuernUntenWennUntenFrei(message) {
    let newNegativY = aktuellerBotBike.currentLocation[1] - 1;
    let naechstePositionUnten = "" + aktuellerBotBike.currentLocation + "-" + newNegativY;
    if (naechstePositionUnten === document.getElementById(naechstePositionUnten).id && document.getElementById(naechstePositionUnten).style.background === "black none repeat scroll 0% 0%") {
        "UNTEN FREI"
        steuern('S');
    } else {
        "UNTEN NICHT FREI"
        botSteuernLinksWennLinksFrei(message);
    }
}

function botSteuernObenWennObenFrei(message) {
    let newY = aktuellerBotBike.currentLocation[1] + 1;
    let naechstePositionOben = "" + aktuellerBotBike.currentLocation + "-" + newY;
    if (naechstePositionOben === document.getElementById(naechstePositionOben).id && document.getElementById(naechstePositionOben).style.background === "black none repeat scroll 0% 0%") {
        "OBEN FREI"
        steuern('N');
    }

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