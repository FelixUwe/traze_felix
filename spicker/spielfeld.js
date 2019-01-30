let spielerFarben = {};

// Bei Nachricht des Gridtopics

function drawPlayers (message) { // bzw. in eurem Fall war das denke ich gridMessage
  const spielfeldGefülltMitSpielerFarben = message.tiles.map(reihe => reihe.map(feld => spielerFarben[feld]));
                                            // Durch das .map werden jeweils alle Einträge des Array behandelt und auf andere
                                            // Einträge abgebildet, tut man dies zweimal (2-dimensionales Array) hat man die 
                                            // einzelnen Felder, in welchen ja die ID der Spieler steht. Diese kann man dann
                                            // als Input für die Variable spielerFarben benutzen, wobei (durch die Verknüpfung
                                            // unten) die jeweilige Farbe ausgegeben wird.
                  ...


// Bei Nachricht des Spielertopics

function (message) { // Beachtet, dass diese message auch vorher durch JSON.parse behandelt werden muss.
  message.forEach(player => {
    spielerFarben[player.id] = player.color; // So wird in das Objekt der Variablen spielerFarben jeweils 
                                             // zusammenhängend die ID eines Spielers und seine Farbe gespeichert.
                  
                  ...
                  
