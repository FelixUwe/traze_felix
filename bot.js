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

//in onmyPlayer()
x = message.position[0];
y = message.position[1];

secretToken = message.secretUserToken;
playerId = message.id;

// in onGrid

if (botMode && x && y) {
    updateBotPosition(message.bikes);
    steerToNextFreePosition(message.tiles);
}


function updateBotPosition(bikes) {
    for (let index = 0; index < bikes.length; index++) {
        if (playerId === bikes[index].playerId) {
            x = bikes[index].currentLocation[0];
            y = bikes[index].currentLocation[1];
        }
    }
}

// in toderkennen function()

if (botMode) {
    bot();
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