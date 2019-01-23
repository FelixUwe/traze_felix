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
    test();
});

function test() {
    let variable = document.getElementById('feld');
    console.log(testMessage);
    variable.innerText = '';

    for (let player of testMessage) {
        console.log(player.name + player.color);
        variable.innerText += (player.name + ', ' + player.color + '\n');
    }

}
