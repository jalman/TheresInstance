var roles = ['resistance','resistance', 'resistance','spy','spy','resistance','spy','resistance','resistance','spy']
var numOnMission = [3,4,4,5,5]; //why would you play without 10 players

var gameRound = 1;

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
  var participants = gapi.hangout.getParticipants();
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

function renderProposeTeam() {
  gapi.hangout.data.setValue("round", "1");

  var participants = gapi.hangout.getParticipants();
  var retVal = gapi.hangout.data.getValue("round");
  console.log(parseInt(retVal));
  var numToChoose = numOnMission[retVal];

  var header = document.getElementById('headerDiv');
  header.innerHTML = '<p>' + numToChoose + ' people left to choose for mission ' + retVal + '!</p>'

  var retVal = '<p>';

  for (var index in participants) {
      var participant = participants[index];
      if (!participant.person) continue;
      retVal += '<form><input type="checkbox" id="choose' + index + '">' + participant.person.displayName + '</form><br>'
  }
  document.getElementById('participantsDiv').innerHTML = retVal;

}

function init() {
	gapi.hangout.data.onStateChanged.add(function() {
	  console.log(gapi.hangout.data.getState());
	});


  // When API is ready...
  gapi.hangout.onApiReady.add(
      function(eventObj) {
        if (eventObj.isApiReady) {
          document.getElementById('showParticipants')
            .style.visibility = 'visible';

          renderProposeTeam();
        }
      });

}

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);
