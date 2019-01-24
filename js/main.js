const url = 'wss://traze.iteratec.de:9443';


const topics = [
    'traze/1/players',
    'traze/1/grid',
    'traze/1/join',
    'traze/1/player/223497130x47913'
];

const newTopics = {
    hf : 'traze/1/player/123497130x47913'
};

let client = mqtt.connect(url, {clientId: '223497130x47913'});
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

    if(topic === topics[3]){
        console.log(JSON.parse(message));
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
        mqttClientName: "223497130x47913"
    };

    client.publish(topics[2],JSON.stringify(joinMsg));
    console.log(topics[2]);


}

function test() {
    playerInformation();


}
