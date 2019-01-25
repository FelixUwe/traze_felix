const url = 'wss://traze.iteratec.de:9443';

const playerId = pickNewID();

const topics = [
    'traze/1/players',
    'traze/1/grid',
    'traze/1/join',
    'traze/1/player/' + playerId
    // hinter player/ war die ID
];


let client = playerId;
// hinter clientID war die ID
let testMessage = '';

let playerMessage = '';
let tickerMessage = '';
let gridMessage = '';

function connect() {
    let userId = pickNewID();
    console.log(userId);
    client = mqtt.connect(url, {clientId: ''});
}

client.on('connect', function () {
    client.subscribe(topics, function (err) {
        if (err) {
            console.log(err);
        }
    });
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
        mqttClientName: "playerId"
        // hinter ClientName war die ID
    };

    client.publish(topics[2],JSON.stringify(joinMsg));
    console.log(topics[2]);


}

function test() {
    console.log(topics);
    playerInformation();


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
