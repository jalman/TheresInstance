var roles = ['resistance','resistance', 'resistance','spy','spy','resistance','spy','resistance','resistance','spy']
var numOnMission = [3,4,4,5,5]; //why would you play without 10 players
var numToChoose = 0;
var numLeftToChoose = 0;

var gameRound = 1;
var gamePhase = "propose";
var participants = null;

function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  while (0!== currentIndex){
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array
}

function showParticipants() {
  participants = gapi.hangout.getParticipants();
  var retVal = '<p>Participants7: </p><ul>';
  for (var i in participants) {
    participant = participants[i];
    retVal += '<p>' + participant.person.displayName + '<p>';
  }
  if (participants[0] === gapi.hangout.getLocalParticipant()) {
    for (var index in participants) {
      var participant = participants[index];

      if (!participant.person) {
        retVal += '<li>A participant not running this app</li>';
      }
      retVal += '<li>' + participant.person.displayName + "-" + shuffle(roles)[index] + '</li>';
    }
  }
  retVal += '</ul>';

  var div = document.getElementById('participantsDiv');

  div.innerHTML = retVal;
}
// proposing a team phase

function renderProposeTeamHeader() {
    var header = document.getElementById('headerDiv');
    numLeftToChoose = numToChoose;
    for (var index in participants) {
        var cb = document.getElementById('choose' + index);
        if (cb.checked) --numLeftToChoose;
    }
    header.innerHTML = '<p>' + numLeftToChoose + ' people left to choose for mission ' + numToChoose + '!</p>'
}

function renderProposeTeam() {
  var retVal = '<p>';

  for (var index in participants) {
      var participant = participants[index];
      if (!participant.person) continue;
      retVal += '<form><input type="checkbox" id="choose' + index + '" onclick="renderProposeTeamHeader();">' + participant.person.displayName + '</form><br>'
  }
  document.getElementById('participantsDiv').innerHTML = retVal;

}

function init() {
	gapi.hangout.data.onStateChanged.add(function() {
        var state = gapi.hangout.data.getState();
        console.log(state);
        if (state['phase'] == 'propose') {
          roundNum = gapi.hangout.data.getValue("round");
          numToChoose = numLeftToChoose = numOnMission[retVal];
          participants = gapi.hangout.getParticipants();
          
          renderProposeTeamHeader();
          renderProposeTeam();
        }
	});


  // When API is ready...
  gapi.hangout.onApiReady.add(
      function(eventObj) {
        if (eventObj.isApiReady) {
          document.getElementById('showParticipants')
            .style.visibility = 'visible';

          gapi.hangout.data.setValue("round", "1");
            gapi.hangout.data.submitDelta( {"round": "1",
                                            "phase": "propose"} );
          

        }
      });

}

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);
