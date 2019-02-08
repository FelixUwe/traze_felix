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

let playerId, secretToken, steerTopic, bailTopic, deadId, x, y, botName, playerName, tabelle;

let id_to_color = {0: 'BLACK'};

let botMode = false;

function muteMusic() {
    if (backgroundMusic.muted === false) {
        backgroundMusic.muted = true;
    } else if (backgroundMusic.muted === true) {
        backgroundMusic.muted = false;
    }
}

function muteGameSounds() {
    if (joinMusic.muted === false) {
        monsterkillMusic.muted = true;
        deathMusic.muted = true;
        joinMusic.muted = true;
    } else {
        monsterkillMusic.muted = false;
        deathMusic.muted = false;
        joinMusic.muted = false;
    }

}

CLIENT.on('connect', function () {
    backgroundMusic = document.getElementById("backgroundMusic");
    joinMusic = document.getElementById("joinMusic");
    monsterkillMusic = document.getElementById("monsterkillMusic");
    deathMusic = document.getElementById("deathMusic");

    backgroundMusic.play();
    document.getElementById("backgroundMusic").loop = true;

    let topics = Object.keys(TOPIC_TO_FUNCTION);
    CLIENT.subscribe(topics, function (err) {
        if (err) {
            console.log(err);
        }
    });
    tabelle = document.getElementById("playerTable");
    //bot();
});

CLIENT.on('message', function (topic, message) {
    message = JSON.parse(message);
    //TOPIC_TO_FUNCTION[topic](message);
});

function onPlayers(players) {
    tabelle.innerText = '';
    let headings = document.createElement("tr");
    headings.setAttribute("align", "left");
    let frags = document.createElement("th");
    let names = document.createElement("th");
    frags.innerText = "Frags";
    names.innerText = "Names";
    headings.appendChild(names);
    headings.appendChild(frags);
    tabelle.appendChild(headings);

    for (let i = 0; i < players.length; i++) {
        id_to_color[players[i].id] = players[i].color;

        let aktuelleZeile = document.createElement("tr");

        let spalteName = document.createElement("td");
        let spalteFrags = document.createElement("td");

        spalteName.innerText += players[i].name;
        spalteFrags.innerText += players[i].frags;

        spalteName.style.color = id_to_color[players[i].id];
        spalteFrags.style.color = id_to_color[players[i].id];

        aktuelleZeile.appendChild(spalteName);
        aktuelleZeile.appendChild(spalteFrags);
        tabelle.appendChild(aktuelleZeile);
    }
}

function steerToNextFreePosition(tiles) {
    if (rechtsGanzFrei(tiles)) {
        steuern('E');
    } else if (linksGanzFrei(tiles)) {
        steuern('W');
    } else if (obenGanzFrei(tiles)) {
        steuern('N');
    } else if (untenGanzFrei(tiles)) {
        steuern('S');
    } else if (rechtsFrei(tiles)) {
        steuern('E');
    } else if (obenFrei(tiles)) {
        steuern('N');
    } else if (linksFrei(tiles)) {
        steuern('W');
    } else {
        steuern('S');
    }
}

function onMyPlayer(message) {
    secretToken = message.secretUserToken;
    playerId = message.id;

    steerTopic = 'traze/1/' + playerId + '/steer';
    bailTopic = 'traze/1/' + playerId + '/bail';

    if (botMode) {
        x = message.position[0];
        y = message.position[1];
    }

    return message;
}

function onGrid(message) {
    drawPlayer(message);
    paintSpawnPoint(message);

    if (botMode && x && y) {
        updateBotPosition(message.bikes);
        steerToNextFreePosition(message.tiles);
    }
}

function onTicker(message) {
    deadId = message.casualty;
    toderkennen();
}

function updateBotPosition(bikes) {
    for (let index = 0; index < bikes.length; index++) {
        if (playerId === bikes[index].playerId) {
            x = bikes[index].currentLocation[0];
            y = bikes[index].currentLocation[1];
        }
    }
}

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

function joinGame() {

    joinMusic.play();
    botMode = false;
    if (document.getElementById("playerNameInput").value === "") {
        playerName = "Superman";
    } else {
        playerName = document.getElementById("playerNameInput").value;
    }


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

    if (deadId === playerId) {
        deathMusic.play();
        document.removeEventListener('keydown', eventListener);
        for (let index = 0; index < steerButtonList.length; index++) {
            let steerButton = steerButtonList[index];
            if (steerButton.classList.contains("deaktiviert")) {
                steerButton.removeAttribute("disabled");
                steerButton.classList.remove("deaktiviert");
            }
        }

        if (botMode) {
            bot();
        }
    } else {
        monsterkillMusic.play();
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
    } else if (event.keyCode == '65') {
        steuern('W');
    } else if (event.keyCode == '83') {
        steuern('S');
    } else if (event.keyCode == '68') {
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

function spielErklaerung() {
    alert("Hi!\nSo funktioniert Traze:\nDu musst mit deinem Charakter so lange überleben wie es geht!\nDafür usst du die Gegner ausschalten und auf dem 62x62 Feld den Platz so gut nutzen, wie es geht.\nDu kannst mit WASD oder den Buttons auf der Website steuern.\nViel Spaß! ");
}

function bot() {
    if (document.getElementById("botnameInput").value === "") {
        botName = "Superbot";
    } else {
        botName = document.getElementById("botnameInput").value;
    }
    disableSteerButtons();

    let joinMsg = {
        name: botName,
        mqttClientName: CLIENT_ID
    };
    botMode = true;
    CLIENT.publish(JOIN_TOPIC, JSON.stringify(joinMsg));
}

function amRechtenRand() {
    return x === GRID_SIZE;
}

function amLinkenRand() {
    return x === 0;
}

function amOberenRand() {
    return y === 0;
}

function amUnterenRand() {
    return y === GRID_SIZE;
}

function rechtsFrei(tiles) {
    return !amRechtenRand() && tiles[x + 1][y] === 0;
}

function linksFrei(tiles) {
    return !amLinkenRand() && tiles[x - 1][y] === 0;
}

function obenFrei(tiles) {
    return !amOberenRand() && tiles[x][y + 1] === 0;
}

function untenFrei(tiles) {
    return !amUnterenRand() && tiles[x][y - 1] === 0;
}

function rechtsGanzFrei(tiles) {
    return rechtsFrei(tiles) && x < GRID_SIZE - 1 && tiles[x + 2][y] === 0;
}

function linksGanzFrei(tiles) {
    return linksFrei(tiles) && x > 1 && tiles[x - 2][y] === 0;
}

function obenGanzFrei(tiles) {
    return obenFrei(tiles) && tiles[x][y + 2] === 0;
}

function untenGanzFrei(tiles) {
    return untenFrei(tiles) && tiles[x][y - 2] === 0;
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