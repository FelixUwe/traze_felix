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

let id_to_color = {};
let id_to_position = {};

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
        let playerCount = playerMessage
    }
    if (topic === topics[1]) {
        gridMessage = JSON.parse(message);
        drawPlayer();
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

function drawPlayer() {
    let spielfelder = document.getElementsByTagName("span");

    for (player of gridMessage.bikes) {
        id_to_position[player.playerId] = {
            trail: player.trail,
            currentlocation: player.currentLocation
        }
    }


    for (player of playerMessage) {
        let x = gridMessage.bikes[0].currentLocation[0];
        let y = gridMessage.bikes[0].currentLocation[1];

        // console.log(gridMessage.bikes[0].trail);

        if (player.id === gridMessage.tiles[x][y]) {
            // console.log(player.color);
        }
        // for (feld of spielfelder) {
        //     if (id_to_position[player].currentlocation == feld.attributes.fieldId) {
        //     }
        // }
    }

    // for (feld of spielfelder) {
    //     if (id_to_position.currentlocation == feld.fieldId) {
    //         // spielfelder.id = {i, j};
    //         console.log(feld.fieldId);
    //         console.log(id_to_position.currentlocation);
    //         document.getElementById("Hi").attributes[1].value =  "background: id_to_color";
    //         console.log(document.getElementById("Hi").attributes[1].value);
    //         spielfelder.fieldId = {i, j};
    //
    //     }
    // }
    for (player of playerMessage) {
        id_to_color[player.id] = player.color;
    }

    // for (let i = 0; i < tiles; i++) {
    //     for (let j = 0; j < tiles; j++) {
    //         if (gridMessage.tiles[i][j] != 0) {
    //             let idDieWirBrauchen = gridMessage.tiles[i][j];
    //
    //
    //
    //
    //
    //         }
    //     }
    // }
}

function playerInformation(){
    document.getElementById('tf1').innerText = '';
    document.getElementById('tf2').innerText = '';
    document.getElementById('tf3').innerText = '';

    for (player of playerMessage) {
        document.getElementById('tf1').innerText += player.name + '\n';
        document.getElementById('tf2').innerText += player.frags + '\n';
        document.getElementById('tf3').innerText += player.owned + '\n';
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
}

function steuern(richtung) {
    let steuernMessage = {course: richtung, playerToken: secretToken };
    console.log(steerTopic, JSON.stringify(steuernMessage));
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
    for (let i = 0; i < tiles; i++) {
        // div.id
        let row = document.createElement("div");
        for (let j = 0; j < tiles; j++) {
            let cell = document.createElement("span");
            row.appendChild(cell);
            cell.setAttribute("style", "");
            cell.fieldId = {i, j};
            cell.setAttribute("id", "asd");
            // console.log(JSON.parse(cell.id));
            // div2.id = {id: div.id+j};
            //console.log(div.id);
            // x und y Attribute machen etc.
        }
        spielfeld.appendChild(row);
    }
}

