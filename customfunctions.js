    //gray out display
    //make "pop up" window on top
    //say "Welcome! In this study, you will receive information about the location of important targets. You will have control over 4 units you can assign to try to capture these targets"
    //Show intel area
    //Show popup saying "Here you will receive information about the location of High Value Targets (HVTs)"
    //Show an intel notification
    //Show map and 4 units
    //Show popup saying "To assign a unit to a location, first click on the unit:"
    //Once they click on it, show popup saying "Then click on the square where you want to send the unit"
    //New popup saying "The yellow arrow shows the path your unit is taking to the assigned location"
    //Maybe? popup saying "You can stop a unit as it's traveling if you need to reassign it"
    //When the unit reaches the square, have it "capture" and return to base
    //New popup saying "If your unit encounters a target, it will automatically capture it and return to the central base location"
    
    //Big popup showing intel probability information
    
    //Move on to tutorial2
    //This one will depend on condition, needs to explain different sources, spot reports, and scoring
//function startTutorial($frame) {
    
//            var text1 = "Welcome!";
//        var text2 = "Your task is to find and capture targets that have been spotted in the area."
//        var text3 = "You will receive intelligence reports about the location of targets."
//        var text4 = "You have control of 4 units that can be deployed to capture targets."
//        var text5 = "Your goal is to capture all targets as quickly as possible."
    
    
    
//}




//define intel object
function Intel(id,acc,risk) {
    this.id = id;
    this.acc = acc;
    this.risk = risk;
}

    //define platoon object
function Plt(homeSq, icon, id) {
    this.homeSq = homeSq;
    this.icon = icon;
    this.id = id;
    this.currentRow = getCoords(parseInt(homeSq.substr(3)) + 1).substr(0,1);
    this.currentCol = getCoords(parseInt(homeSq.substr(3)) + 1).substr(1);
    this.goalRow = "";
    this.goalCol = "";
    this.lastMoveTime = -99;
    this.status = "base";
    this.xfirst = true;
    this.msg = "";
    this.points = 0;
    //this.accuracy = acc;
}

       
//define target object
function target(loc,startTime) {
    this.loc = loc;
    this.startTime = startTime;
    this.status = "inactive";
    this.type = "unknown";
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    
    while (0 != currentIndex) {
        randomIndex = Math.floor(Math.random()*currentIndex);
        currentIndex -= 1;
        
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function startPlt($plts,$index) {
        
    $('#assignUnit input').val('');
    $('#assignUnit').fadeTo('fast',0);

    //enable the appropriate button
    if ($plts[$index].status == "moving") {
        $('#status' + ($index + 1) + ' p').html('Platoon ' + ($index+1) + ": Moving");
        $('#status' + ($index + 1) + ' button').fadeTo('fast',1);
    }
    else {
        $('#status' + ($index + 1) + ' p').html('Platoon ' + ($index+1) + ": Returning");
    }
    
    $('#status' + ($index + 1) + ' p').parent().removeClass();
    $('#status' + ($index + 1) + ' p').parent().addClass($plts[$index].status);
    
    //randomize x or y first
    var $randNum = Math.floor(Math.random() * 2);
    if ($randNum == 0) {
        $plts[$index].xfirst = true;
    }
    else {
        $plts[$index].xfirst = false;
    }

    //add movement arrows
    var $goal = [($plts[$index].goalCol), $plts[$index].goalRow];
    var $curr = [($plts[$index].currentCol), $plts[$index].currentRow];
    addArrows($index+1,$goal,$curr,$plts[$index].xfirst,$plts[$index].status);          
}

function stopPlt($plts,$index,$score,$maxScore) {

    var $currSq = getSq($plts[$index].currentRow + $plts[$index].currentCol);
    var $status = "stopped";
    var $title  = ": Stopped";
    if ($currSq == $plts[$index].homeSq.substr(3)) {
        $status = "base";
        $title = ": At Base";
        if ($plts[$index].msg != "") {
            $('#captureTB').append('<p>' + $plts[$index].msg + '</p>');
            $plts[$index].msg = "";
            $targetsdone++;
        }
        
        if ($plts[$index].points > 0) {
            //update score progress bar
            if ($frame == "+"){
                $score = $score + $plts[$index].points;
            } else {
                $score = $score - $plts[$index].points;
            }
            
            $('#progShell').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100, function() {
                $('#scorePanel h3').html("Score: " + $score + "/" + $maxScore);
            //$('#scorePanel #prog').css('height',($score/$maxScore*100)+'%');
            $('#scorePanel #prog').animate({
                height: ($score/$maxScore*100)+'%'
            },'slow');
            });
            
            $plts[$index].points = 0;
            
            if ($score == $maxScore) {
                //game is over
            }
        }
        
        //need to end the game here if all targets have been found or missed
        if ($targetsdone >= $nHvts){
            endGame();
        }
    }
    $plts[$index].status = $status;
    
    //disable the appropriate button and change status
    $('#status' + ($index+1) + ' p').html('Platoon ' + ($index+1) + $title);
    $('#status' + ($index+1) + ' p').parent().removeClass().addClass($status);
    $('#status' + ($index+1) + ' button').fadeTo('fast',0);
    
    //remove arrows
    $('.arrow.' + ($index+1) + ',.endarrow.' + ($index+1)).fadeOut('fast', function() { 
        $(this).remove();
    });
    
    //make platoon reappear
    //see if there's already a unit there and hide it if so
    if ($('#sq' + $currSq).children('.plt').length > 0) {
        var $children = $('#sq' + $currSq).children('.plt');
        
        if ($children.length == 1) {
            //if only unit is the current one (movement just started)
            if (($children).attr('id') == 'plt' + ($index + 1)){
                $('#plt' + ($index+1)).fadeIn('fast');
                return $score;
            }
            else {
                var $which = parseInt($children.attr('id').substr(3))-1;
                if ((($plts[$which].status == "stopped")||($plts[$which].status == "base")) && (!$children.hasClass('hidden'))){
                    $children.toggleClass('hidden');  
                }
            }
        }
        else {
            for (i=0; i<$children.length; i++){
                var $which = parseInt($($children[i]).attr('id').substr(3))-1;
                if ((($plts[$which].status == "stopped")||($plts[$which].status == "base")) && (!$($children[i]).hasClass('hidden')) && ($which!=$index)){
                    $($children[i]).toggleClass('hidden');  
                }
                else if ($which == $index) {
                    $('#plt' + ($which + 1)).fadeIn('fast');
                }
            }
        }
    }
    
    $('#plt' + ($index+1)).appendTo('#sq' + $currSq).fadeIn('fast');
   return $score
}

function addArrows($whichPlt,$goal,$curr,$xfirst,$status) {
    var $goalSq = getSq($goal[1] + $goal[0]);
    var $currSq = getSq($curr[1] + $curr[0]);    
    var $nCols = ($curr[0] - $goal[0]);
    var $nRows = ($curr[1].charCodeAt(0) - $goal[1].charCodeAt(0));   
    
    if ($xfirst){
        if ($nCols != 0) { $currSq = addArrow($nCols,$currSq,$whichPlt,'i','x',$status); }
        if ($nRows != 0) { addArrow($nRows,$currSq,$whichPlt,'14 * i','y',$status); }
    }
    
    else {
        if ($nRows!= 0) { $currSq = addArrow($nRows,$currSq,$whichPlt,'14 * i','y',$status); }
        if ($nCols != 0) { addArrow($nCols,$currSq,$whichPlt,'i','x',$status); }
    }
}

function addArrow($nSteps,$refSq,$whichPlt,$stepSize,$whichLeg,$status) {
    var $expr = '$refSq + ' + $stepSize;
    var $dir = 'up';
    if ($nSteps > 0) {
        $expr = '$refSq - ' + $stepSize;
        if ($whichLeg == 'x'){$dir = 'left';}
    }
    else {
        if ($whichLeg == 'x'){$dir = 'right';}
        else { $dir = 'down'; }
    }
    
    $('<div class="arrow endpoint ' + $dir + ' ' + $whichPlt + ' ' + $whichLeg + ' ' + $status + '"></div>').hide().appendTo('#sq' + $refSq).fadeIn('fast');
    
    for (i=1; i <= Math.abs($nSteps); i++) {        
        if (i == Math.abs($nSteps)) {
            $('<div class="endarrow ' + $dir + ' ' + $whichPlt + ' ' + $status + '"></div>').hide().appendTo('#sq' + (eval($expr))).fadeIn('fast');
            return eval($expr);
        }
        else {
            var $arrows = '<div class="arrow ' + $whichPlt + ' ' + $whichLeg + ' ' + $status + '"></div>';
            $($arrows).hide().appendTo('#sq' + (eval($expr))).fadeIn('fast');
        }          
    }
}

function changeHeight() {
    if (!$tutorialRunning){
    
    //var $totalWidth = parseInt($('#mapPanel').css('width'));

    var $totalWidth2 = window.innerWidth;
    $totalWidth = $totalWidth2/2;
    $('#mapPanel').css('width',Math.floor($totalWidth/14)*14);
    $totalWidth = parseInt($('#mapPanel').css('width'));
    $('#mapPanel').css('height',$totalWidth);
    $('.mapSquare').css({'width': Math.floor($totalWidth/14) - 2, 'height': Math.floor($totalWidth/14) - 2 });
    $('#intelPanel').css('width',$totalWidth2 *.4);
    $('#intelPanel').css('height',$totalWidth/3 *1.7);
    $('#rowNames>div').css('height',Math.floor($totalWidth/14));
    $('#rowNames span').css('top',parseInt($('#rowNames div').css('height'))/2 - parseInt($('#rowNames span').css('height'))/2);  
    $('#colNames>div').css('width',Math.floor($totalWidth/14));

    var $mapRight2 = $('#mapPanel').offset().left + $totalWidth;
    var $mapBottom = $('#mapPanel').offset().top + $totalWidth;
    $('#scorePanel2').css('left',$mapRight2 - parseInt($('#scorePanel2').css('width')) - 6);
    $('#cbPanel').css('left',$('#intelPanel').position().left);
    $('#cbPanel').css('width',$('#intelPanel').css('width'));
    $('#assignUnit').css('margin-left',$('#mapPanel').position().left-7);
    $('#capturePanel').css('height',$totalWidth/3 * 1.25);
    $('#capturePanel').css('width',(parseInt($('#intelPanel').css('width'))+6)/2 - 6 - 2);
    $('#capturePanel').css('top',$mapBottom - parseInt($('#capturePanel').css('height')));
    $('#capturePanel').css('left',$('#intelPanel').position().left);
    $('#scorePanel').css('top',$('#capturePanel').css('top'));
    $('#scorePanel').css('width',$('#capturePanel').css('width'));
    $('#scorePanel').css('height',$('#capturePanel').css('height'));
    $('#scorePanel').css('left',parseInt($('#capturePanel').css('left'))+parseInt($('#capturePanel').css('width')) + 6 + 4);
    }
}

function getCoords(sqNum) {
    var $letter = 'A'.charCodeAt(0); 
    var $whichRow = String.fromCharCode(Math.ceil(sqNum/14)-1 + $letter);
    var $whichCol = sqNum % 14;
    if ($whichCol == 0) { $whichCol = 14; }
    return $whichRow + $whichCol;
}

function getSq($coords) {
    var $letter = 'A'.charCodeAt(0);
    var $whichRow = $coords.substr(0,1).charCodeAt(0) - $letter;
    var $whichCol = parseInt($coords.substr(1));
    var $sq = $whichRow * 14 + $whichCol - 1;
    return $sq;
}

function timer($elapsedTime) {
    $elapsedTime++
    var $elapsedMinutes = Math.floor($elapsedTime/60);
    var $elapsedSeconds = $elapsedTime % 60;
    var $displayTime = ""
    if ($elapsedSeconds < 10){
            $displayTime = $elapsedMinutes + ":0" + $elapsedSeconds
        } else {
            $displayTime = $elapsedMinutes + ":" + $elapsedSeconds;
    }
    if ($elapsedMinutes < 10){
        $displayTime = "0" + $displayTime
    }
    
    $('#time span').html($displayTime);
    return $elapsedTime;
}

var myvar;
function tutorialtimer() {
    myvar = setInterval(function() {
        
    $elapsedTime = timer($elapsedTime);
    //check if any platoons are moving
    for (i=0; i<$plts.length; i++) {
        if (($plts[i].status == "moving") || ($plts[i].status == "returning")) {
            if ($elapsedTime >= $plts[i].lastMoveTime + 3){
                //move the platoon (update current row and current col)
                $plts[i].lastMoveTime = $elapsedTime;

                if ($plts[i].xfirst) {
                    if ($plts[i].currentCol != $plts[i].goalCol) {
                        if ($plts[i].goalCol < $plts[i].currentCol) {$plts[i].currentCol--;}
                        else {$plts[i].currentCol++;}   
                    }
                    else if ($plts[i].currentRow != $plts[i].goalRow){
                        if ($plts[i].goalRow.charCodeAt(0) < $plts[i].currentRow.charCodeAt(0)) {
                            $plts[i].currentRow = String.fromCharCode($plts[i].currentRow.charCodeAt(0) - 1);
                        }
                        else {
                            $plts[i].currentRow = String.fromCharCode($plts[i].currentRow.charCodeAt(0) + 1);
                        } 
                    }
                }

                else {
                    if ($plts[i].currentRow != $plts[i].goalRow){
                        if ($plts[i].goalRow.charCodeAt(0) < $plts[i].currentRow.charCodeAt(0)) {
                            $plts[i].currentRow = String.fromCharCode($plts[i].currentRow.charCodeAt(0) - 1);
                        }
                        else {
                            $plts[i].currentRow = String.fromCharCode($plts[i].currentRow.charCodeAt(0) + 1);
                        } 
                    }
                    else if ($plts[i].currentCol != $plts[i].goalCol) {
                        if ($plts[i].goalCol < $plts[i].currentCol) { $plts[i].currentCol--;}
                        else {$plts[i].currentCol++;}                        
                    }
                }

                if (($plts[i].currentRow == $plts[i].goalRow) && ($plts[i].currentCol == $plts[i].goalCol)){
                    $score = stopPlt($plts,i,$score,$maxScore);
                }
            }
        }

//        if (($plts[i].status == "moving") || ($plts[i].status == "stopped")) {
//            //check to see if any targets are captured
//
//            for (j=0; j<$nHvts; j++) {
//                if ($hvts[j].status == "active") {             
//                    if (getSq($plts[i].currentRow+$plts[i].currentCol) == $hvts[j].loc){  
//                        //capture or false alarm                        
//                        //current hvt is "j"
//
//                        var $capture = -1;
//                        var $hvtType = "HVT ";
//
//                        if ($hvts[j].type == "low") {
//                            //make capture 100%
//                            $capture = 1;
//                            $hvtType = "LVT "
//                        } else if ($hvts[j].type == "high") {
//                            //make false alarm 50% likely, then hvt goes away
//                            $capture = Math.floor(Math.random() * 2);
//                            console.log('hvt' + j + $capture);  
//                        } else {
//                            //shouldn't be eligible to be captured
//                        }
//
//                        if ($capture > 0) {
//                            $hvts[j].status = "captured";
//
//
//                            if ($hvts[j].type == "low") {
//                                $plts[i].points = $lvtPoints;
//
//                            } else if ($hvts[j].type == "high") {
//                                if ($frame == "+"){
//                                    $plts[i].points = $hvtPoints;
//                                }
//                            }
//                            $plts[i].msg = "Unit " + (i+1) + ": " + $hvtType + (j+1) + " captured (" + $frame + $plts[i].points + ")";
//                            var tempdataobj = {time: $elapsedTime, type: "targetcapture", points: $plts[i].points, unit: i, target: j};
//                            data2 += "," + JSON.stringify(tempdataobj);    
//                        }
//                        else {
//                            $hvts[j].status = "lost";
//                            if ($hvts[j].type == "high"){
//                                if ($frame == "-"){
//                                    $plts[i].points = $hvtPoints;
//                                }
//                            }
//                            $plts[i].msg = "Unit " + (i+1) + ": " + $hvtType + (j+1) + " false alarm (" + $frame + $plts[i].points + ")";
//                            var tempdataobj = {time: $elapsedTime, type: "targetloss", points: $plts[i].points, unit: i, target: j};
//                            data2 += "," + JSON.stringify(tempdataobj); 
//                        }
//                        if ($plts[i].status == "moving") {
//                            $score = stopPlt($plts,i,$score,$maxScore);
//                        }
//                        $plts[i].status = "returning";
//                        var $goalSq = parseInt($plts[i].homeSq.substr(3)) + 1;
//                        $plts[i].goalRow = getCoords($goalSq).substr(0,1);
//                        $plts[i].goalCol = parseInt(getCoords($goalSq).substr(1));
//                        $plts[i].lastMoveTime = $elapsedTime;
//                        $('#plt' + (i+1)).fadeOut(0);
//                        startPlt($plts,i);
//                        break
//                    }
//                }
//            }   
//        }
    }

//    //activate targets, add intel notifications
//    for (i=0; i<$nHvts; i++){
//        if ($elapsedTime == $hvts[i].startTime){
//            //$hvts[i].status = "active";
//
//            //go through 2 intel boxes
//            for (j=0; j<2; j++){
//
//                var $reportedSq = getCoords($hvts[i].loc + 1)               
//                var $targRow = $reportedSq.substr(0,1).charCodeAt(0) - letter;
//                var $targCol = parseInt($reportedSq.substr(1)) - 1;
//
//                var $accuracy = $srcAccuracy[j];
//                var $possibleSqs = [];
//
//                if ($accuracy < 3) {
//                    //get 8 surrounding squares (less if near edge) + indicated square (9 possibilites)
//                    for (k=-1; k<2; k++){
//                        for (l=-1; l<2; l++) {
//                            $tempRow = $targRow + k;
//                            $tempCol = $targCol + l;
//                            //make sure it's within bounds
//                            if (($tempRow >= 0) && ($tempRow < 14) && ($tempCol >= 0) && ($tempCol <14)){
//                                $tempRow = String.fromCharCode($tempRow + letter);
//                                $tempCol = $tempCol + 1;
//                                $possibleSqs.push($tempRow + $tempCol);
//                            }
//                        }
//                    }
//
//                    if ($accuracy == 1) {
//                        //.75 correct square, .25 one of the surrounding 9
//                        var $randNum = Math.floor(Math.random() * 4);
//                        if ($randNum < 3) {
//                            //reported square is accurate
//                        }
//                        else {
//                            var $randNum = Math.floor(Math.random() * $possibleSqs.length);
//                            $reportedSq = $possibleSqs[$randNum];
//                        }
//                    }
//                    else if ($accuracy == 2) {
//                        //pick one of these 9 randomly
//                        var $randNum = Math.floor(Math.random() * $possibleSqs.length);
//                        $reportedSq = $possibleSqs[$randNum];
//                    }
//                }
//
//                else if ($accuracy == 3) {
//                    //get 25 surrounding squares (less if near edge)
//                    //let's not do this one
//                    for (k=-2; k<3; k++){
//                        for (l=-2; l<3; l++) {
//                            $tempRow = $targRow + k;
//                            $tempCol = $targCol + l;
//                            //make sure it's within bounds
//                            if (($tempRow >= 0) && ($tempRow < 14) && ($tempCol >= 0) && ($tempCol <14)){
//                                $tempRow = String.fromCharCode($tempRow + letter);
//                                $tempCol = $tempCol + 1;
//                                $possibleSqs.push($tempRow + $tempCol);
//                            }
//                        }
//                    }
//                    //pick one of these randomly
//                    var $randNum = Math.floor(Math.random() * $possibleSqs.length);
//                    $reportedSq = $possibleSqs[$randNum];
//                }
//
//                var $risk = $srcRisk[j];
//
//                //think about populating this info on the spot instead of ahead of time, to mitigate some cheating
//                if ($risk == "high"){
//                    $('#intel' + (j+1)).append('<p class = "hvtinfo" id = "info' + i +'">HVT' + (i+1) + ' sighted at <span id="span' + i + '">' + $reportedSq + '</span></p>');
//                } else {
//                    $('#intel' + (j+1)).append('<p class = "hvtinfo" id = "info' + i +'">LVT' + (i+1) + ' sighted at <span id="span' + i + '">' + $reportedSq + '</span></p>');
//                }                         
//
//                $('#intel' + (j+1) + ' #info' + i).append('<button>Show</button>');
//                $('#intel' + (j+1) + ' #info' + i).on('click', 'button', function() {
//
//                    //which hvt line is this?
//                    var $temphvt = $(this).parent().attr('id').substr(4);
//                    $hvts[$temphvt].status = "active";
//
//                    //show location info, disable button in other intel box
//                    $('.intelTBs #info' + $temphvt).find('button').prop('disabled', true);
//                    $(this).hide();
//                    $(this).parent().find('span').fadeIn('fast');            
//
//                    $('.intelTBs #info' + $temphvt).not($(this).parent()).css('color', 'lightgray');
//
//                    //depending on which source was clicked, assign whether hvt type is low or high value
//                    var $tempintel = $(this).parent().parent().attr("id").substr(5)-1;
//                    if ($intels[$tempintel].risk == "low"){
//                        $hvts[$temphvt].type = "low";
//                    } else {
//                        $hvts[$temphvt].type = "high";
//                    }
//
//                    var tempdataobj = {time: $elapsedTime, type: "choosesource", target: $temphvt, risk: $intels[$tempintel].risk, reportedSq: $(this).parent().find('span')[0].innerHTML}                                                                   
//                    data2 += "," + JSON.stringify(tempdataobj);
//                });
//
//            }
//        }
//    } 

}, 1000);
}



