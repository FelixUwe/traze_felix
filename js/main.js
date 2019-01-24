const url = 'wss://traze.iteratec.de:9443';
const playerTopic = 'traze/1/players';
const gridTopic = 'traze/1/grid';
const tickerTopic  = 'traze/1/ticker';
const joinTopic = 'traze/1/join';
const hfTopic = 'traze/1/player/123497130x47913';

const topics = [
    playerTopic,
    tickerTopic,
    gridTopic,
    joinTopic,
    hfTopic
];

const newTopics = {
    hf : 'traze/1/player/123497130x47913'
};

let client = mqtt.connect(url, {clientId: '123497130x47913'});
let testMessage = '';

let playerMessage = '';
let tickerMessage = '';
let gridMessage = '';

client.on('connect', function () {
    client.subscribe(topics, function (err) {
        if (err) {
            console.log(err);
        }
    })
});

client.on('message', function (topic, message) {

    if (topic !== topics[0] && topic !== topics[2]) {
        console.log(JSON.parse(message));
    }
    if (topic === topics[0]) {
        playerMessage = JSON.parse(message);
    }
    else if (topic === topics[1]){
        tickerMessage = JSON.parse(message);
    }
    else if(topic === topics[2]){
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
        mqttClientName: "123497130x47913"
    };

    client.publish(joinTopic,JSON.stringify(joinMsg));


}

function test() {
    playerInformation();
    

}
