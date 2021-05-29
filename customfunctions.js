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


//reset everything for each practice and test run
function resetAll($frame, ntargets){
    
    //stop all previous platoons?

    $outoftime = false;
    $targetsdone = 0;
    $maxScore = ntargets * 2;
    
    $elapsedTime = 0;
    $('.mapSquare').removeClass('tutorial1 tutorial2 clickadded');
    $('button').removeClass('clickadded');
    
    //make array of 4 platoons
    $plts = [
        new Plt("#sq90","plt1.png","plt1"),
        new Plt("#sq91","plt2.png","plt2"),
        new Plt("#sq104","plt3.png","plt3"),
        new Plt("#sq105","plt4.png","plt4")
    ];
    
    //empty out hvt array
    $hvts = []
    
    //add platoons to base location
    for (i=0; i<$plts.length; i++) {
        $($plts[i].homeSq).append($('#plt' + (i+1)).removeClass('hidden'));
        
        $('#status' + (i+1) + ' p').html('Platoon ' + (i+1) + ': At Base');
        $('#status' + (i+1) + ' p').parent().removeClass().addClass('base');
    }
    
    if ($frame == "+"){
        $score = 0;
    } else {
        $score = $maxScore;
    }
    //reset progress bar text and height
    $maxScore = ntargets * 2;
    $('#scorePanel h3').html("Score: " + $score + "/" + $maxScore);
    $('#scorePanel #prog').css('height',($score/$maxScore*100)+'%');
    
    //remove text from textboxes
    $('#captureTB').empty();
    $('#intel1>p').remove();
    $('#intel2>p').remove();
    
    //make checkboxes
    $('#cbPanel ul').empty();
    for (i=0; i<ntargets; i++){
       // $('#cbPanel ul').append('<li><input type="checkbox" name="hvtCB">HVT' + (i+1) + '</li>');

        $('#cbPanel ul').append('<li><span>&#10004</span><button class="hvtCB">Target ' + (i + 1) + '&nbsp&#9660</button><div class = "dropdowncontent"><a href = "#" class = "p-active disabled">Active</a><a href = "#" class = "p-captured">Captured</a><a href = "#" class = "p-missed">Missed</a></div></li>'); 
    }
    
//    //uncheck any checkboxes
//    $('li>span').removeClass('show');
//    $('.dropdowncontent').children().removeClass('disabled');
//    $('.p-active').addClass('disabled');
    
    $('#littleoverlay').remove();
    if ($phase == "bigpractice"){
        $('#littleoverlay2').remove();
    }
    
    
}



//define intel object
function Intel(id,accs,risk) {
    this.id = id;
    this.acc = accs;
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

function stopPlt(platoon,$score,$maxScore,ntargets,alreadyended) {
    
    var $index = $plts.indexOf(platoon);
    
    var $currSq = getSq(platoon.currentRow + platoon.currentCol);
    var $status = "stopped";
    var $title  = ": Stopped";
    if ($currSq == platoon.homeSq.substr(3)) {
        $status = "base";
        $title = ": At Base";
        if (platoon.msg != "") {
            $('#captureTB').append('<p>' + platoon.msg + '</p>');
            platoon.msg = "";
            $targetsdone++;
            
            //move through 2nd tutorial/practice steps
            if ($phase == "practice2"){
            myintro2.nextStep();
            
        }
        }
        
        if (platoon.points > 0) {
            //update score progress bar
            if ($frame == "+"){
                $score = $score + platoon.points;
            } else {
                $score = $score - platoon.points;
            }
            
            $('#progShell').fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100, function() {
                $('#scorePanel h3').html("Score: " + $score + "/" + $maxScore);
            //$('#scorePanel #prog').css('height',($score/$maxScore*100)+'%');
            $('#scorePanel #prog').animate({
                height: ($score/$maxScore*100)+'%'
            },'slow');
            });
            
            platoon.points = 0;
            
            if ($score == $maxScore) {
                //game is over
            }
        }
        
        
        //need to end the game here if all targets have been found or missed
        if (!alreadyended){
            if ($targetsdone >= ntargets){
                endGame(ntargets);         
            }
        }
        
    }
    platoon.status = $status;
    
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
    
    
    //var $totalWidth = parseInt($('#mapPanel').css('width'));

    var $totalWidth2 = window.innerWidth;
        var $mapheight = window.innerHeight - 140;
    
        //make sure the display isn't too tall for the window size
        $totalWidth = $totalWidth2/2;
        if ($totalWidth > $mapheight){
            $totalWidth = $mapheight - 5;
        }
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
    //$('#scorePanel2').css('left',$mapRight2 - parseInt($('#scorePanel2').css('width')) - 6);
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
    
    
    //something here like if (phase != 'test')
    //position the hidden tutorial div for the map
    $('#littleoverlay').css('top', $('#sq59').offset().top);
    $('#littleoverlay').css('left', $('#sq59').offset().left);
    $('#littleoverlay').css('width', parseInt($('.mapSquare').css('width')) * 3 + 4);
    $('#littleoverlay').css('height', parseInt($('.mapSquare').css('width')) * 3 + 4);
    
    //position the hidden intel + score div for practice2
    $('#littleoverlay2').css('top', $('#capturePanel').offset().top);
    $('#littleoverlay2').css('left', $('#capturePanel').offset().left);
    $('#littleoverlay2').css('width', $('#capturePanel').width()* 2 + 16);
    $('#littleoverlay2').css('height', $('#capturePanel').height() + 6);
                            
    
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

function timer($elapsedTime,ntargets) {
    $elapsedTime++
    
    if ($timepressure){
        $clockTime = $timelimit - $elapsedTime;
        if ($clockTime < 120){
            $('#time span').css('color','red');
            $('#time span').css('font-weight', 'bold');
            $("#time").css("border","3px solid red")
        }
        if ($clockTime == 0){
            //ran out of time
            $outoftime = true;
            endGame(ntargets);
        }
    } else {
        $clockTime = $elapsedTime
    }
    var $clockMinutes = Math.floor($clockTime/60);
    var $clockSeconds = $clockTime % 60;
    var $displayTime = ""
    if ($clockSeconds < 10){
            $displayTime = $clockMinutes + ":0" + $clockSeconds
        } else {
            $displayTime = $clockMinutes + ":" + $clockSeconds;
    }
    if ($clockMinutes < 10){
        $displayTime = "0" + $displayTime
    }
    
    $('#time span').html($displayTime);

    return $elapsedTime;
}

function endGame(ntargets) {
    
    for (i=0; i<$plts.length; i++) {
        if (($plts[i].status == "moving") || ($plts[i].status == "returning")) {
            stopPlt($plts[i], 0, $maxScore, ntargets, true)
        }
    }

    if ($phase != 'tutorial'){
        $('#captureTB').append('<p>Finished!</p>');
        
        if ($phase == "practice"){
            timerdone = true;
            clearInterval(myvar);
            console.log("practice over?");
            setTimeout(function(){
                tutorial2();
            },3000);

        } else if ($phase == "practice2"){
            timerdone = true;
            clearInterval(myvar);
//            console.log("practice2 over?");
//            setTimeout(function(){
//                startBigPractice();
//            },3000);

        } else if ($phase == "bigpractice"){
            timerdone = true;
            clearInterval(myvar);

            if ($outoftime){
                console.log('you ran out of time!');
                endBigPractice("outoftime")
                //need a pop up message about this
            } else {
                endBigPractice("completed")
                console.log('you did it!')
                //here too
            }

            //console.log('time for the real deal');
            // setTimeout(function(){
            //     //put a message here
            //     startRealTest();
            // },3000);
            
        } else if ($phase == "test"){
            timerdone = true;
            clearInterval(myvar);
            
            if ($outoftime){
                console.log('you ran out of time!');
                endRealTest("outoftime");
            } else {
                console.log('you did it!')
                endRealTest("completed")
            }
            
            
            
        }
        
    }
    
    //clearInterval(mytimer);
}

function startRealTest(){
    $phase = "test"
    var ntargets = $nHvts;
    $('#time span').css('color','black');
    $('#time span').css('font-weight', 'normal');
    $("#time").css("border","3px solid black")

    if ($timepressure){
        $timelimit = ntargets * 60;
    }
    
    //reset from tutorial
    resetAll($frame, ntargets);
    
    //show clock
    document.getElementById("time").style.display = "block";
    
    //make targets for real (randomized locations)
    for (i=0; i<ntargets; i++){
        var $temploc = Math.floor(Math.random() * 196);
        var $excluded = [75,76,77,78,89,90,91,92,103,104,105,106,117,118,119,120];
        if (i > 0) {$excluded.push($hvts[i-1].loc);} //prevent 2 hvts at same loc in a row
        while ($excluded.indexOf($temploc) != -1){
            $temploc = Math.floor(Math.random() * 196);
        }
        var $temptime = i*hvtInterval + $startTime;
        $hvts[i] = new target($temploc,$temptime);
    }
    
    //write data with these hvt locations?
    
    //make intel for real (order of boxes should match what's already been shown)
    for (i=0; i<2; i++){
        //accuracy going to be category 1 (50% reported square, 50% surround)
        $intels[i] = new Intel(i,1,$srcRisk[i]);
    }
    
    testtimer(ntargets,"bigpractice");
}

function movePlatoon(platoon,ntargets){
    platoon.lastMoveTime = $elapsedTime;

    if (platoon.xfirst) {
        if (platoon.currentCol != platoon.goalCol) {
            if (platoon.goalCol < platoon.currentCol) {platoon.currentCol--;}
            else {platoon.currentCol++;}   
        }
        else if (platoon.currentRow != platoon.goalRow){
            if (platoon.goalRow.charCodeAt(0) < platoon.currentRow.charCodeAt(0)) {
                platoon.currentRow = String.fromCharCode(platoon.currentRow.charCodeAt(0) - 1);
            }
            else {
                platoon.currentRow = String.fromCharCode(platoon.currentRow.charCodeAt(0) + 1);
            } 
        }
    }

    else {
        if (platoon.currentRow != platoon.goalRow){
            if (platoon.goalRow.charCodeAt(0) < platoon.currentRow.charCodeAt(0)) {
                platoon.currentRow = String.fromCharCode(platoon.currentRow.charCodeAt(0) - 1);
            }
            else {
                platoon.currentRow = String.fromCharCode(platoon.currentRow.charCodeAt(0) + 1);
            } 
        }
        else if (platoon.currentCol != platoon.goalCol) {
            if (platoon.goalCol < platoon.currentCol) { platoon.currentCol--;}
            else {platoon.currentCol++;}                        
        }
    }

    if ((platoon.currentRow == platoon.goalRow) && (platoon.currentCol == platoon.goalCol)){
        
        if (platoon.status == "returning" && $phase == "tutorial"){
             $('.introjs-tooltipbuttons').css('visibility','visible');
            myintro.nextStep()
        }
        
        $score = stopPlt(platoon,$score,$maxScore,ntargets);
    }
}

function checkCaptures(platoon, ntargets,phase){
    var i = $plts.indexOf(platoon);
    for (j=0; j<ntargets; j++) {
        if ($hvts[j].status == "active") {             
            if (getSq(platoon.currentRow+platoon.currentCol) == $hvts[j].loc){  
                //capture or false alarm                        
                
                var $capture = -1;
                var $hvtType = "HVT ";
                
                if (phase == "practice"){
                    $capture = 1;
                } else {
                    if ($hvts[j].type == "low") {
                        //make capture 100%
                        $capture = 1;
                        $hvtType = "LVT "
                    } else if ($hvts[j].type == "high") {
                        //make false alarm 50% likely, then hvt goes away
                        $capture = Math.floor(Math.random() * 2);
                        //console.log('hvt' + j + $capture);  
                    } else {
                        //shouldn't be eligible to be captured
                    }
                }

                if ($capture > 0) {
                    $hvts[j].status = "captured";


                    if ($hvts[j].type == "low") {
                        platoon.points = $lvtPoints;

                    } else if ($hvts[j].type == "high") {
                        if ($frame == "+"){
                            platoon.points = $hvtPoints;
                        }
                    }
                    platoon.msg = "Unit " + (i+1) + ": " + $hvtType + (j+1) + " captured (" + $frame + platoon.points + ")";
                    var tempdataobj = {time: $elapsedTime, type: "targetcapture", points: platoon.points, unit: i, target: j};
                    data2 += "," + JSON.stringify(tempdataobj);    
                }
                else {
                    $hvts[j].status = "lost";
                    if ($hvts[j].type == "high"){
                        if ($frame == "-"){
                            platoon.points = $hvtPoints;
                        }
                    }
                    platoon.msg = "Unit " + (i+1) + ": " + $hvtType + (j+1) + " false alarm (" + $frame + platoon.points + ")";
                    var tempdataobj = {time: $elapsedTime, type: "targetloss", points: platoon.points, unit: i, target: j};
                    data2 += "," + JSON.stringify(tempdataobj); 
                }
                if (platoon.status == "moving") {
                    $score = stopPlt(platoon,$score,$maxScore,ntargets);
                }
                platoon.status = "returning";
                var $goalSq = parseInt(platoon.homeSq.substr(3)) + 1;
                platoon.goalRow = getCoords($goalSq).substr(0,1);
                platoon.goalCol = parseInt(getCoords($goalSq).substr(1));
                platoon.lastMoveTime = $elapsedTime;
                $('#' + platoon.id).fadeOut(0);
                  
                startPlt($plts,i);
                break
            }
        }
    }   
}

function getReportedSquare(targ,intel){
    //console.log(intel);
    //console.log(intel.acc);
    var $reportedSq = getCoords(targ.loc + 1)               
    var $targRow = $reportedSq.substr(0,1).charCodeAt(0) - letter;
    var $targCol = parseInt($reportedSq.substr(1)) - 1;

    //figure out how to make this a different value for each target if needed (for practice)
    //var $accuracy = $srcAccuracy[j];
    var $accuracy = intel.acc;
    if ($phase == "practice"){
        $accuracy = intel.acc[i];
    }
    
    var $possibleSqs = [];

    //need to figure out accuracy values
    //if 3, always reported square?
    //if 2, 75%, 25%
    //if 1, 50%, 50%
    //if 4, only surrounding squares
    //if 5, widen to 25 squares
    //if 99, pick the top left square (this is just for the current practice setup)

    //get possible surrounding squares
    //get 8 surrounding squares (less if near edge) + indicated square (9 possibilites)
    //need this to just be the surrounding squares, actually?
    for (k=-1; k<2; k++){
        for (l=-1; l<2; l++) {
            $tempRow = $targRow + k;
            $tempCol = $targCol + l;
            //make sure it's within bounds
            if (($tempRow >= 0) && ($tempRow < 14) && ($tempCol >= 0) && ($tempCol <14)){
                $tempRow = String.fromCharCode($tempRow + letter);
                $tempCol = $tempCol + 1;
                if ($tempRow + $tempCol != $reportedSq){
                    $possibleSqs.push($tempRow + $tempCol);
                }
            }
        }
    }
    
    //console.log($accuracy);

    switch($accuracy) {

      case 1:
        //.5 correct square, .5 one of the surrounding 9
        var $randNum = Math.floor(Math.random() * 2);
        if ($randNum < 1) {
            //reported square is accurate
        }
        else {
            var $randNum = Math.floor(Math.random() * $possibleSqs.length);
            $reportedSq = $possibleSqs[$randNum];
        }
        break;
      case 2:
        var $randNum = Math.floor(Math.random() * 4);
        if ($randNum > 3) {
            var $randNum = Math.floor(Math.random() * $possibleSqs.length);
            $reportedSq = $possibleSqs[$randNum];
        }
        break;
      case 3:
        // use reported square
        break;
        case 4:
          //pick one of the surrounding squares randomly
          var $randNum = Math.floor(Math.random() * $possibleSqs.length);
          $reportedSq = $possibleSqs[$randNum];
            break;
        case 99:
            //pick top left
            $reportedSq = $possibleSqs[0];
            break;
        case 5:
            //get 25 surrounding squares (less if near edge)
            //let's not do this one
            for (k=-2; k<3; k++){
                for (l=-2; l<3; l++) {
                    $tempRow = $targRow + k;
                    $tempCol = $targCol + l;
                    //make sure it's within bounds
                    if (($tempRow >= 0) && ($tempRow < 14) && ($tempCol >= 0) && ($tempCol <14)){
                        $tempRow = String.fromCharCode($tempRow + letter);
                        $tempCol = $tempCol + 1;
                        $possibleSqs.push($tempRow + $tempCol);
                    }
                }
            }
            //pick one of these randomly
            var $randNum = Math.floor(Math.random() * $possibleSqs.length);
            $reportedSq = $possibleSqs[$randNum];
    }
    return $reportedSq;
}

function populateIntel(intel,j,i,reportedsq){
        
    var $risk = intel.risk;
                
    //think about populating this info on the spot instead of ahead of time, to mitigate some cheating
    if ($risk == "high"){
        $('#intel' + (j+1)).append('<p class = "hvtinfo" id = "info' + i +'">HVT' + (i+1) + ' sighted at <span id="span' + i + '">' + reportedsq + '</span></p>');
    } else {
        $('#intel' + (j+1)).append('<p class = "hvtinfo" id = "info' + i +'">LVT' + (i+1) + ' sighted at <span id="span' + i + '">' + reportedsq + '</span></p>');
    }                         

    $('#intel' + (j+1) + ' #info' + i).append('<button>Show</button>');
    $('#intel' + (j+1) + ' #info' + i).on('click', 'button', function() {

        //which hvt line is this?
        var $temphvt = $(this).parent().attr('id').substr(4);
        $hvts[$temphvt].status = "active";

        //show location info, disable button in other intel box
        $('.intelTBs #info' + $temphvt).find('button').prop('disabled', true);
        $(this).hide();
        $(this).parent().find('span').fadeIn('fast');            

        $('.intelTBs #info' + $temphvt).not($(this).parent()).css('color', 'lightgray');

        //depending on which source was clicked, assign whether hvt type is low or high value
        var $tempintel = $(this).parent().parent().attr("id").substr(5)-1;
        if ($intels[$tempintel].risk == "low"){
            $hvts[$temphvt].type = "low";
        } else {
            $hvts[$temphvt].type = "high";
        }

        var tempdataobj = {time: $elapsedTime, type: "choosesource", target: $temphvt, risk: $intels[$tempintel].risk, reportedSq: $(this).parent().find('span')[0].innerHTML}                                                                   
        data2 += "," + JSON.stringify(tempdataobj);
    });
}

//var myvar;
function testtimer(ntargets,phase) {
    timerdone = false;
    myvar = setInterval(function() {
        
        $elapsedTime = timer($elapsedTime,ntargets);
        //check if any platoons are moving
        
        if ($phase == "practice"){
            //do a check to see if they need a hint?
            if ($elapsedTime - $hvts[1].startTime == 18){
                $('#intel1').append('<p style="color:red;">HINT: if the target is not in the indicated location, look in the 8 surrounding squares</p>');
            }
        }

        for (i=0; i<$plts.length; i++) {
            if (($plts[i].status == "moving") || ($plts[i].status == "returning")) {
                if ($elapsedTime >= $plts[i].lastMoveTime + 3){
                    movePlatoon($plts[i],ntargets);
                }
            }
            
            if (!timerdone){                
                if (($plts[i].status == "moving") || ($plts[i].status == "stopped")) {
                    //check to see if any targets are captured          
                    checkCaptures($plts[i], ntargets,phase)
                }
            }
        }
        
        if (!timerdone) {
            //activate targets, add intel notifications
            for (i=0; i<ntargets; i++){
                if ($elapsedTime == $hvts[i].startTime){

                    //go through 2 intel boxes
                    for (var j=0; j<$intels.length; j++){

                        var $reportedSq = getReportedSquare($hvts[i], $intels[j]);
                        populateIntel($intels[j],j,i,$reportedSq);

                    }
                }
            } 
        };

        

    }, $timeunits);
}


function tutorialtimer(ntargets) {
        
        myvar = setInterval(function() {
        
        $elapsedTime = timer($elapsedTime,ntargets);
        
        //check if any platoons are moving
        for (i=0; i<$plts.length; i++) {

            if (($plts[i].status == "moving") || ($plts[i].status == "returning")) {
                if ($elapsedTime >= $plts[i].lastMoveTime + 3){
                    //move the platoon (update current row and current col)
                    movePlatoon($plts[i],ntargets);
                }
            }

            if (($plts[i].status == "moving") || ($plts[i].status == "stopped")) {
                
                //check to see if the tutorial target is captured
                for (j=0; j<ntargets; j++) {
                    console.log(ntargets);


                if ($hvts[j].status == "active") {   
                    console.log($plts[0].status)          
                    if (getSq($plts[i].currentRow+$plts[i].currentCol) == $hvts[j].loc){  
                        console.log('onrightsquare')
                        //capture or false alarm                        
                        //current hvt is "j"
                        
                        var $capture = 1;

                        //hardwire capture or not for tutorials?
                        if (j ==1){
                            $capture = 0;
                        }
                        
                        var $hvtType = "HVT ";
                        if ($hvts[j].type == "low") {
                            $hvtType = "LVT "
                        }


                        if ($capture > 0) {
                            $hvts[j].status = "captured";


                            if ($hvts[j].type == "low") {
                                $plts[i].points = $lvtPoints;

                            } else if ($hvts[j].type == "high") {
                                if ($frame == "+"){
                                    $plts[i].points = $hvtPoints;
                                    
                                }
                                console.log($frame)
                                
                            }
                            
                            $plts[i].msg = "Unit " + (i+1) + ": " + $hvtType + (j+1) + " captured (" + $frame + $plts[i].points + ")";
                            var tempdataobj = {time: $elapsedTime, type: "targetcapture", points: $plts[i].points, unit: i, target: j};
                            data2 += "," + JSON.stringify(tempdataobj);    
                        }
                        else {
                            $hvts[j].status = "lost";
                            if ($hvts[j].type == "high"){
                                if ($frame == "-"){
                                    $plts[i].points = $hvtPoints;
                                }
                            }
                            $plts[i].msg = "Unit " + (i+1) + ": " + $hvtType + (j+1) + " false alarm (" + $frame + $plts[i].points + ")";
                            var tempdataobj = {time: $elapsedTime, type: "targetloss", points: $plts[i].points, unit: i, target: j};
                            data2 += "," + JSON.stringify(tempdataobj); 
                        }
                        if ($plts[i].status == "moving") {
                            $score = stopPlt($plts[i],$score,$maxScore,ntargets);
                        }
                        $plts[i].status = "returning";
                        var $goalSq = parseInt($plts[i].homeSq.substr(3)) + 1;
                        $plts[i].goalRow = getCoords($goalSq).substr(0,1);
                        $plts[i].goalCol = parseInt(getCoords($goalSq).substr(1));
                        $plts[i].lastMoveTime = $elapsedTime;
                        $('#plt' + (i+1)).fadeOut(0);
                        startPlt($plts,i);
                        if ($phase == "tutorial"){
                             myintro.nextStep();
                        }  
                       
                        break
                    }
                } 
            }
            }
        }
    }, $timeunits)};


