const url = 'wss://traze.iteratec.de:9443';

const clientId = pickNewID();
let playerId = '';

const topics = [
    'traze/1/players',
    'traze/1/grid',
    'traze/1/join',
    'traze/1/player/' + clientId
    // hinter player/ war die ID
];


let client = mqtt.connect(url, {clientId: clientId});
let testMessage = '';

let playerMessage = '';
let tickerMessage = '';
let gridMessage = '';

let secretToken = '';
let steerTopic = '';
let bailTopic = '';


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
        playerInformation();
    }
    if (topic === topics[1]) {
        gridMessage = JSON.parse(message);
        gridErstellen(gridMessage);
    }


});

function playerInformation() {
    document.getElementById('feld1').innerText = '';

    for (player of playerMessage) {
        document.getElementById('feld1').innerText += player.name + '\n';
    }

    document.getElementById('feld2').innerHTML = tickerMessage;
    document.getElementById('feld3').innerHTML = gridMessage;

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
}

function steuern(richtung) {
    let steuernMessage = {course: richtung, playerToken: secretToken};
    console.log(steerTopic, JSON.stringify(steuernMessage));
    client.publish(steerTopic, JSON.stringify(steuernMessage));
}

function steuerInput() {
    document.addEventListener('keydown', event => {
        event = event || window.event;
        // W
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
    let bailMessage = {playerToken: secretToken};
    console.log(bailTopic);
    console.log(bailMessage);
    client.publish(bailTopic, JSON.stringify(bailMessage));
}

function pickNewID() {
    let d = new Date().getTime();
    if (Date.now) {
        d = Date.now(); //high-precision timer
    }
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;

}

function gridErstellen(gridMessage) {
    let tiles = gridMessage.tiles;
    for (let i = 0; i < tiles.length; i++) {
        for (let j = 0; j < tiles.length; j++) {

        }
    }
}