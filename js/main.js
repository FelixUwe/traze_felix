const url = 'wss://traze.iteratec.de:9443';
const playerTopic = 'traze/1/players';

let client = mqtt.connect(url);

let testMessage = '';

client.on('connect', function () {
    client.subscribe(playerTopic, function (err) {
        if (err) {
            console.log(err);
        }
    })
});

client.on('message', function (topic, message) {
    testMessage = JSON.parse(message);
});

function test() {
    console.log(testMessage);
}
