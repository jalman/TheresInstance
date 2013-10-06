var roles = ['resistance','resistance', 'resistance','spy','spy','resistance','spy','resistance','resistance','spy']
var numOnMission = [1,1,1,2,2]; //why would you play without 10 players
var numToChoose = 0;
var numLeftToChoose = 0;
var chosenTeam = [];

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
  var retVal = '<p>Participants8: </p><ul>';
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
        if (cb && cb.checked) --numLeftToChoose;
    }
    header.innerHTML = '<p>' + numLeftToChoose + ' people left to choose for mission ' + roundNum + '!' +
        '<input type="submit" value="propose it!" id="propose" onclick="submitTeam();"></input>' + '</p>'

    document.getElementById('propose').disabled = (numLeftToChoose > 0);
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
function submitTeam() {
    var team = [];
    for (var index in participants) {
        var cb = document.getElementById('choose' + index);
        if (team.length < numToChoose && cb.checked) {
            team.push(index);
        }
    }
    gapi.hangout.data.submitDelta( {"phase": "approve",
                                    "team": JSON.stringify(team) });
}

// approve/reject phase

function approveReject() {
    var retVal = '<p>Mission team chosen by leader:<br>';
    for (var i in chosenTeam) {
        retVal += participants[chosenTeam[i]].person.displayName + '<br>';
    }
    document.getElementById('headerDiv').innerHTML = retVal;

    var res = document.getElementById('participantsDiv');

	retVal = '<button type="button">Approve</button>';
	retVal += '<br>';
	retVal += '<button type="button">Reject</button>';

    res.innerHTML = retVal;
}


function updateResults() {
	var state = gapi.hangout.data.getState();
	for (var rnd = 4; rnd >= 0; rnd--) {
		var str = state["rnd" + rnd + ""];
		if (!str || str.length == 0) {
			continue;
		}
		var miss = getMission(str);

		var ret = "";

		ret = ret + '<p>The Mission for Round ' + (rnd + 1) + ': </p><ul>';


		for (var i in miss) {
			var participant = miss[i];
			ret += '<p>' + participant.person.displayName + '<p>';
		}



		break;
	}

	var res = document.getElementById('resultsDiv');
	res.innerHTML = ret;

}

function getMission(str) {
	ret = new Array();
	for (var i = 0; i < str.length; i++) {
		ret[i] = participants[parseInt(str.charAt(i))];
	}
	return ret;
}



function init() {


	gapi.hangout.data.onStateChanged.add(function() {
        updateResults();

        var state = gapi.hangout.data.getState();
        console.log(state);
        if (state['phase'] == 'propose') {
          roundNum = gapi.hangout.data.getValue("round");
          numToChoose = numLeftToChoose = numOnMission[roundNum-1];

          renderProposeTeam();
          renderProposeTeamHeader();
        }
        else if (state['phase'] == 'approve') {
            chosenTeam = JSON.parse(state['team']);
            console.log(chosenTeam);
            approveReject();
        }
	});


  // When API is ready...
  gapi.hangout.onApiReady.add(
      function(eventObj) {
        if (eventObj.isApiReady) {
          participants = gapi.hangout.getParticipants();
          document.getElementById('showParticipants')
            .style.visibility = 'visible';

            gapi.hangout.data.submitDelta( {"round": "1",
                                            "phase": "propose",
                                            "rnd0": "0"} );


        }
      });


      updateResults();
}

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);
