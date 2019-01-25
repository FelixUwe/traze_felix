const url = 'wss://traze.iteratec.de:9443';

let playerId2 = '';

let topics = [
    'traze/1/players',
    'traze/1/grid',
    'traze/1/join',
    'traze/1/player/323497130x47913',
];

const newTopics = {
    hf : 'traze/1/player/123497130x47913'
};

let client = mqtt.connect(url, {clientId: '323497130x47913'});
let testMessage = '';

let playerMessage = '';
let tickerMessage = '';
let gridMessage = '';

let secretToken = '';
let steerTopic = '';


client.on('connect', function () {
    client.subscribe(topics, function (err) {
        if (err) {
            console.log(err);
        }
    })
});

client.on('message', function (topic, message) {

    if(topic === topics[3]){
        message = JSON.parse(message);
        console.log(message);
        secretToken =  message.secretUserToken;
        playerId2 = message.id;
        steerTopic = 'traze/1/' + playerId2 + '/steer';
        console.log(playerId2);

        playerInformation();
    }

    if (topic === topics[0]) {
        playerMessage = JSON.parse(message);
    }
    if(topic === topics[1]){
        gridMessage = JSON.parse(message);
    }

});

function playerInformation(){
    document.getElementById('feld1').innerText = '';

    for (player of playerMessage) {
        document.getElementById('feld1').innerText += player.name + '\n';
    }

    document.getElementById('feld2').innerHTML = tickerMessage;
    document.getElementById('feld3').innerHTML = gridMessage;

    //console.log(playerMessage);
    // document.getElementById('feld1').innerHTML = playerInformation;
}


function joinGame(){

    let joinMsg = {
        name: "ANT-MAN!",
        mqttClientName: "323497130x47913"
    };

    steuerInput();

    client.publish(topics[2],JSON.stringify(joinMsg));
    console.log(topics[2]);
    //
}

function test() {
    playerInformation();
    console.log(secretToken);
    console.log(playerId2);

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
       else if (event.keyCode == '83'){
           steuern('S');
       }
       // D
       else if (event.keyCode == '68'){
           steuern('E');
       }
    });
}
