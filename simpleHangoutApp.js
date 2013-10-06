var roles = ['resistance','resistance', 'resistance','spy','spy','resistance','spy','resistance','resistance','spy']
var numOnMission = [1,1,1,2,2]; //why would you play without 10 players
var numToChoose = 0;
var numLeftToChoose = 0;
var chosenTeam = [];
var votes = [];
var IOnMission = false;

var myPlayerIndex = 0;
var myRole = 'resistance';
var gameRound = 1;
var gamePhase = "propose";
var participants = null;

var approveRejectMenuRendered = false;
var countYes = 0;
var countNo = 0;

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

function submitVote(index, vote) {
    var res = document.getElementById('participantsDiv');
    if (vote == 0) {
        res.innerHTML = 'mission approved! waiting on others to cast their votes...';
    }
    else if (vote == 1) {
        res.innerHTML = 'mission rejected! waiting on others to cast their votes...';
    }

    var votei = "vote" + index;
    var obj = {};
    obj[votei] = JSON.stringify(vote);
    gapi.hangout.data.submitDelta(obj);
}

function approveReject() {
    var retVal = '<p>Mission team chosen by leader:<br>';
    for (var i in chosenTeam) {
        retVal += participants[chosenTeam[i]].person.displayName + '<br>';
    }
    document.getElementById('headerDiv').innerHTML = retVal;

    var res = document.getElementById('participantsDiv');

	retVal = '<input type="submit" value="approve" onclick="submitVote(' + myPlayerIndex + ', 0);"></input>';
	retVal += '<br>';
    retVal += '<input type="submit" value="reject" onclick="submitVote(' + myPlayerIndex + ', 1);"></input>';

    res.innerHTML = retVal;
}


function submitPassFail(index, vote) {
	var res = document.getElementById('participantsDiv');
    if (vote == 0) {
        res.innerHTML = 'mission succeeded! waiting on others to make their decisions...';
    }
    else if (vote == 1) {
        res.innerHTML = 'mission failed! waiting on others to make their decisions...';
    }

    var votei = "vote" + index;
    var obj = {};
    obj[votei] = JSON.stringify(vote);
    gapi.hangout.data.submitDelta(obj);
}





function isIn(obj, a) {
	for (var b in a) {
		if (obj == b) {
			return true;
		}
	}
	return false;
}

function succeedFail() {
	countNo = 0;
	countYes = 0;

    gapi.hangout.data.submitDelta( {"phase": "vote" });

    for (var i=0; i<participants.length; ++i) {
        votes[i] = -1;
    }
	if (isIn(myPlayerIndex, chosenTeam)) {
		IOnMission = true;
	} else {
		IOnMission = false;
	}

	var retVal = "Mission Phase. <br>";

	if (!IOnMission) {
		retVal += "You are not on the mission. Please wait for votes to be counted.";
	}

	if(IOnMission) {
		retVal += "You are on the mission. Please vote! <br>";
		retVal += '<input type="submit" value="Succeed" onclick="submitPassFail(' + myPlayerIndex + ', \'0\');"></input>';

		if(myRole == 'spy') {
			retVal += ' <br> <input type="submit" value="Fail" onclick="submitPassFail(' + myPlayerIndex + ', \'1\');"></input>';
		}
	}

	document.getElementById('participantsDiv').innerHTML = retVal;
}
// results
function checkMissionStatus() {
    console.log("woo");
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


function start() {
	state['phase'] = 'propose';

	gapi.hangout.data.submitDelta( {"started": "true"} );
}


function init() {
	state['phase'] = 'start';
	document.getElementById('participantsDiv').innerHTML = "<input type="submit" value="Start the Game!" onclick="start();"></input>";

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
            if (!approveRejectMenuRendered) {
                chosenTeam = JSON.parse(state['team']);
                approveReject();
                approveRejectMenuRendered = true;
            }
            else {
                for (var k in state) {
                    if (k.substring(0,4) == "vote") {
                        votes[parseInt(k[4])] = parseInt(state[k]);
                    }
                }
                console.log(votes);
                var finished = true;
                for (var i=0; i<votes.length; ++i) {
                    if (votes[i] == -1) finished = false;
                }
                if (finished) {
                    succeedFail();
                }
            }
        }
        else if (state['phase'] == 'vote') {
            for (var k in state) {
                if (k.substring(0,4) == "vote") {
                    votes[parseInt(k[4])] = parseInt(state[k]);
                }
            }
            console.log(votes);
            var finished = true;
            for (var i=0; i<votes.length; ++i) {
                if (votes[i] == -1) finished = false;
            }
            if (finished) {
                checkMissionStatus();
            }
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

            var myName = gapi.hangout.getLocalParticipant();
            for (var i in participants) {
                votes.push(-1);
                if (participants[i].person.displayName == myName) {
                    myPlayerIndex = i;
                }
            }
        }
      });


      updateResults();
}

// Wait for gadget to load.
gadgets.util.registerOnLoadHandler(init);
