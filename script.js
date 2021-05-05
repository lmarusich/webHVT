//define variables

//start tutorial
//start test

//tutorial1
//practice1
//tutorial2/practice2
//bigpractice
//test
//test2?

//test variables
var $phase = "tutorial";
var $timepressure = false;
var $frame = "+";
var $fasttrack1 = false;
var $fasttrack2 = false;
//timelimit 10 min?
var $timelimit = 10 * 60;
var $outoftime = false;
var $nHvts = 15;
var $startTime = 5;
var hvtInterval = 5;
var $elapsedTime = 0;
var $score = 0;
var $maxScore = $nHvts * 2;
var $hvtPoints = 2;
var $lvtPoints = 1;
//var $srcAccuracy = shuffle([1,1]);
var $srcRisk = shuffle(["high", "low"]);
//randomize which source is a gamble vs a sure thing
var $hvts = [];
var $intels = [];
var $plts = [];
var $targetsdone = 0;
var $isPaused = false;
var letter = 'A'.charCodeAt(0);

//data0 = condition (time pressure, gains/losses, etc.)
data2 = "{events:[}";


$(document).ready(function(){
    
    //get framing condition
    $('#framingbutton').on('click',function() {
        //var nameValue = document.getElementById("uniqueID").value;
        //add a data event here that the game was resumed
        if(document.getElementById("gains").checked){
            $frame = "+";
        } else {
            $frame = "-";
            $score = $maxScore;
        }
        
        if(document.getElementById("fasttrack1").checked){
            $fasttrack1 = true;
        }
        
        if(document.getElementById("fasttrack2").checked){
            $fasttrack2 = true;
        }
        
        if(document.getElementById("timepressure").checked){
            $timepressure = true;
        }
        
        //reset progress bar text and height
        $('#scorePanel h3').html("Score: " + $score + "/" + $maxScore);
        $('#scorePanel #prog').css('height',($score/$maxScore*100)+'%');
        
        
        document.getElementById("frameoptions").style.display = "none";
        document.getElementById("overlay").style.display = "none";
        document.getElementById("resume").style.display = "inline";
        //adjust height and location of elements based on window size
        changeHeight();
        //need to disable resizing if tutorial is running?
        startTutorial($frame);
        
    });
    
    //match time/pause panel width to assignUnit panel width
    $('#time').css('width',$('#assignUnit').css('width'));
    
    //add row and column names to map panel
     
    for (i=0; i<14; i++) {
        $("#rowNames").append('<div><span>'+String.fromCharCode(letter+i)+'</span></div>');
        $("#colNames").append('<div>' + (i+1) + '</div>');
    }
    
    //add grid squares to map 
    for (i=0; i<(14*14); i++){
        $('#mapPanel').append('<div class="mapSquare" id=sq' + i + '></div');
    } 
    
    //make array of 4 platoons
    $plts = [
        new Plt("#sq90","plt1.png","plt1"),
        new Plt("#sq91","plt2.png","plt2"),
        new Plt("#sq104","plt3.png","plt3"),
        new Plt("#sq105","plt4.png","plt4")
    ];
    
    //add platoons to base location
    for (i=0; i<$plts.length; i++) {
        $($plts[i].homeSq).append($('#plt' + (i+1)).toggleClass('hidden'));
    }
    

    
    $(window).resize(function(){
        changeHeight();
    });
    
    
    //add checkboxes
    for (i=0; i<$nHvts; i++){
       // $('#cbPanel ul').append('<li><input type="checkbox" name="hvtCB">HVT' + (i+1) + '</li>');

        $('#cbPanel ul').append('<li><span>&#10004</span><button class="hvtCB">Target ' + (i + 1) + '&nbsp&#9660</button><div class = "dropdowncontent"><a href = "#" class = "p-active disabled">Active</a><a href = "#" class = "p-captured">Captured</a><a href = "#" class = "p-missed">Missed</a></div></li>'); 
    }
    
    
    $(document).on('click','#cbPanel button',function(){
        $(this).parent().find('.dropdowncontent').toggleClass('show');
    });
    
    
    //change appearance when a dropdown item is selected
    //$('#cbPanel a').on('click', function() {
    $(document).on('click','#cbPanel a',function(){
        //if clicked on "captured" add a checkbox
        if ($(this).hasClass('p-captured')){
            $(this).parent().parent().children('span').html('&#10004');
            $(this).parent().parent().children('span').addClass('show');
            $(this).parent().parent().children('span').css('color', '#009900');
        } else if ($(this).hasClass('p-active')){
            $(this).parent().parent().children('span').removeClass('show');
        } else if ($(this).hasClass('p-missed')){
            $(this).parent().parent().children('span').html('&#10008');
            $(this).parent().parent().children('span').addClass('show');
            $(this).parent().parent().children('span').css('color', 'red');
        }
        
        $(this).parent().children('a').removeClass('disabled');
        
        var tempdataobj = {time: $elapsedTime, type: "marktarget", target: $('#cbPanel li').index($(this).parent().parent()), mark: $(this).attr('class')} 
        
        data2 += "," + JSON.stringify(tempdataobj);
        
        $(this).addClass('disabled');
        //if clicked on "missed" add an x
        //if clicked on "active" remove all that    
    });
    
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
      if (!event.target.matches('.hvtCB')) {
        var dropdowns = document.getElementsByClassName("dropdowncontent show");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    } 
        
    //highlight platoon when clicked
    $('.plt').on("click",function() {       
        $(this).toggleClass("highlight");
        var $whichSq = parseInt($(this).parent().attr('id').substring(2)) + 1;
        $('.highlight').not(this).toggleClass("highlight");
        
        if ($(this).hasClass("highlight")) {
            $("#assignUnit").fadeTo('fast',1);
            $("#assignUnit p").html('Platoon ' + $(this).attr('id').substr(3) + ': ' + getCoords($whichSq) + ' to' );
        } else {
            $('#assignUnit').fadeTo('fast',0);
        }
    });
    
    $('.mapSquare').on("mouseover",function() {   
        //console.log('hover');
        $('.mapSquare').removeClass('hover');
        var $sqNum = $(this).attr('id').substr(2);              
        if($('.plt').hasClass("highlight")) {
            var $highlighted = parseInt($('.plt.highlight').parent().attr('id').substring(2)) + 1;
            if ((($highlighted) != $sqNum) && ($(this).children('.plt').length == 0)) {
                $(this).addClass("hover");
                $('#assignUnit input').val(getCoords(parseInt($sqNum) + 1));
            }
        }
    });
    
    //if user clicks a square on the map, and a unit is selected, send the unit there
    $('.mapSquare').on("click",function() {  
        if ($(this).children('.plt.highlight').length == 0) {
            if ($('.plt').hasClass('highlight')){
                var $highlightedPlt = $('.plt.highlight');
                var $whichPlt = parseInt($highlightedPlt.attr('id').substr(3));
                var $goalSq = getCoords(parseInt($(this).attr('id').substr(2))+1);
                $(this).removeClass('hover');
                $highlightedPlt.fadeOut('fast',function() {
                    $currSq = $(this).parent();                               
                    $(this).removeClass('highlight');     
                    $plts[$whichPlt - 1].status = "moving"; //change status of that platoon object                                      
                    $plts[$whichPlt - 1].goalRow = $goalSq.substr(0,1);
                    $plts[$whichPlt - 1].goalCol = parseInt($goalSq.substr(1));
                    $plts[$whichPlt - 1].lastMoveTime = $elapsedTime;
                    
                    startPlt($plts,$whichPlt-1);
                    
                    var tempdataobj = {time: $elapsedTime, type: "assignunit", unit: $whichPlt-1, currentSq: $plts[$whichPlt - 1].currentRow + $plts[$whichPlt - 1].currentCol, goalSq: $goalSq}
                    
                    data2 += "," + JSON.stringify(tempdataobj);
                              
                    //check for hidden units in same square, make them visible
                    if (($currSq).children('.plt.hidden').length > 0) {
                        $currSq.children('.plt.hidden').first().toggleClass('hidden');
                    }
                });                
            }
        }
    });
    
    //need to check if the below is still needed
    $('input[type=checkbox]').on('click',function() {
        if ($(this).attr('name') == 'hvtCB'){
            $(this).parent().toggleClass('checked');
        }   
    });
    
    $('#status button').on('click',function() {
        var whichPlt = parseInt($(this).parent().attr('id').substr(6))-1;
        var tempdataobj = {time: $elapsedTime, type: "stopunit", unit: whichPlt, currentSq: $plts[whichPlt].currentRow + $plts[whichPlt].currentCol};
        data2 += "," + JSON.stringify(tempdataobj);
        $score = stopPlt($plts[whichPlt],whichPlt,$score,$maxScore);
    });
    
    //define pause button
    $('#pause').on('click',function() {
        $isPaused = true;
        //add a data event here that the game was paused
        document.getElementById("overlay").style.display = "block";
    });
    
    //define resume button
    $('#resume').on('click',function() {
        $isPaused = false;
        //add a data event here that the game was resumed
        document.getElementById("overlay").style.display = "none";
    });
    
        
    //startTutorial;
    //don't show timer
    
    
    //$("#intelPanel").toggleClass('divoverlay');
    //tutorialtimer();
    
    //startTest;
   
});
    

    
    
    
    
    

    
//    //define pause button
//    $('#pause').on('click',function() {
//        $isPaused = true;
//        //add a data event here that the game was paused
//        document.getElementById("overlay").style.display = "block";
//    });
//    
//    //define resume button
//    $('#resume').on('click',function() {
//        $isPaused = false;
//        //add a data event here that the game was resumed
//        document.getElementById("overlay").style.display = "none";
//    });
//    
//
//    
//    //make array of 2 intel groups
//    for (i=0; i<2; i++){
//        $intels[i] = new Intel(i,$srcAccuracy[i],$srcRisk[i]);
//    }
//    
//
//
//
//    //make array of xx targets
//    for (i=0; i<$nHvts; i++){
//        var $temploc = Math.floor(Math.random() * 196);
//        var $excluded = [75,76,77,78,89,90,91,92,103,104,105,106,117,118,119,120];
//        if (i > 0) {$excluded.push($hvts[i-1].loc);} //prevent 2 hvts at same loc in a row
//        while ($excluded.indexOf($temploc) != -1){
//            $temploc = Math.floor(Math.random() * 196);
//        }
//        var $temptime = i*hvtInterval + $startTime;
//        $hvts[i] = new target($temploc,$temptime);
//    }
//    
//    //record the hvt array
//    //submit('{"hvts":' + JSON.stringify($hvts) + '}');
//    data1 = '{"hvts":' + JSON.stringify($hvts) + '}';
//    //check that this can be parsed, don't know what i'm doing
//

//    
//
//
//    

//    

//    
//
//    
//    mytimer = setInterval(function() {
//        if ($isPaused == false){
//        $elapsedTime = timer($elapsedTime);
//        //check if any platoons are moving
//        for (i=0; i<$plts.length; i++) {
//            if (($plts[i].status == "moving") || ($plts[i].status == "returning")) {
//                if ($elapsedTime >= $plts[i].lastMoveTime + 3){
//                    //move the platoon (update current row and current col)
//                    $plts[i].lastMoveTime = $elapsedTime;
//                    
//                    if ($plts[i].xfirst) {
//                        if ($plts[i].currentCol != $plts[i].goalCol) {
//                            if ($plts[i].goalCol < $plts[i].currentCol) {$plts[i].currentCol--;}
//                            else {$plts[i].currentCol++;}   
//                        }
//                        else if ($plts[i].currentRow != $plts[i].goalRow){
//                            if ($plts[i].goalRow.charCodeAt(0) < $plts[i].currentRow.charCodeAt(0)) {
//                                $plts[i].currentRow = String.fromCharCode($plts[i].currentRow.charCodeAt(0) - 1);
//                            }
//                            else {
//                                $plts[i].currentRow = String.fromCharCode($plts[i].currentRow.charCodeAt(0) + 1);
//                            } 
//                        }
//                    }
//                       
//                    else {
//                        if ($plts[i].currentRow != $plts[i].goalRow){
//                            if ($plts[i].goalRow.charCodeAt(0) < $plts[i].currentRow.charCodeAt(0)) {
//                                $plts[i].currentRow = String.fromCharCode($plts[i].currentRow.charCodeAt(0) - 1);
//                            }
//                            else {
//                                $plts[i].currentRow = String.fromCharCode($plts[i].currentRow.charCodeAt(0) + 1);
//                            } 
//                        }
//                        else if ($plts[i].currentCol != $plts[i].goalCol) {
//                            if ($plts[i].goalCol < $plts[i].currentCol) { $plts[i].currentCol--;}
//                            else {$plts[i].currentCol++;}                        
//                        }
//                    }
//                     
//                    if (($plts[i].currentRow == $plts[i].goalRow) && ($plts[i].currentCol == $plts[i].goalCol)){
//                        $score = stopPlt($plts,i,$score,$maxScore);
//                    }
//                }
//            }
//            
//            if (($plts[i].status == "moving") || ($plts[i].status == "stopped")) {
//                //check to see if any targets are captured
//                
//                for (j=0; j<$nHvts; j++) {
//                    if ($hvts[j].status == "active") {             
//                        if (getSq($plts[i].currentRow+$plts[i].currentCol) == $hvts[j].loc){  
//                            //capture or false alarm                        
//                            //current hvt is "j"
//                            
//                            var $capture = -1;
//                            var $hvtType = "HVT ";
//                            
//                            if ($hvts[j].type == "low") {
//                                //make capture 100%
//                                $capture = 1;
//                                $hvtType = "LVT "
//                            } else if ($hvts[j].type == "high") {
//                                //make false alarm 50% likely, then hvt goes away
//                                $capture = Math.floor(Math.random() * 2);
//                                console.log('hvt' + j + $capture);  
//                            } else {
//                                //shouldn't be eligible to be captured
//                            }
//
//                            if ($capture > 0) {
//                                $hvts[j].status = "captured";
//                                
//                                
//                                if ($hvts[j].type == "low") {
//                                    $plts[i].points = $lvtPoints;
//                                    
//                                } else if ($hvts[j].type == "high") {
//                                    if ($frame == "+"){
//                                        $plts[i].points = $hvtPoints;
//                                    }
//                                }
//                                $plts[i].msg = "Unit " + (i+1) + ": " + $hvtType + (j+1) + " captured (" + $frame + $plts[i].points + ")";
//                                var tempdataobj = {time: $elapsedTime, type: "targetcapture", points: $plts[i].points, unit: i, target: j};
//                                data2 += "," + JSON.stringify(tempdataobj);    
//                            }
//                            else {
//                                $hvts[j].status = "lost";
//                                if ($hvts[j].type == "high"){
//                                    if ($frame == "-"){
//                                        $plts[i].points = $hvtPoints;
//                                    }
//                                }
//                                $plts[i].msg = "Unit " + (i+1) + ": " + $hvtType + (j+1) + " false alarm (" + $frame + $plts[i].points + ")";
//                                var tempdataobj = {time: $elapsedTime, type: "targetloss", points: $plts[i].points, unit: i, target: j};
//                                data2 += "," + JSON.stringify(tempdataobj); 
//                            }
//                            if ($plts[i].status == "moving") {
//                                $score = stopPlt($plts,i,$score,$maxScore);
//                            }
//                            $plts[i].status = "returning";
//                            var $goalSq = parseInt($plts[i].homeSq.substr(3)) + 1;
//                            $plts[i].goalRow = getCoords($goalSq).substr(0,1);
//                            $plts[i].goalCol = parseInt(getCoords($goalSq).substr(1));
//                            $plts[i].lastMoveTime = $elapsedTime;
//                            $('#plt' + (i+1)).fadeOut(0);
//                            startPlt($plts,i);
//                            break
//                        }
//                    }
//                }   
//            }
//        }
//        
//        //activate targets, add intel notifications
//        for (i=0; i<$nHvts; i++){
//            if ($elapsedTime == $hvts[i].startTime){
//                //$hvts[i].status = "active";
//                
//                //go through 2 intel boxes
//                for (j=0; j<2; j++){
//                    
//                    var $reportedSq = getCoords($hvts[i].loc + 1)               
//                    var $targRow = $reportedSq.substr(0,1).charCodeAt(0) - letter;
//                    var $targCol = parseInt($reportedSq.substr(1)) - 1;
//                    
//                    var $accuracy = $srcAccuracy[j];
//                    var $possibleSqs = [];
//                
//                    if ($accuracy < 3) {
//                        //get 8 surrounding squares (less if near edge) + indicated square (9 possibilites)
//                        for (k=-1; k<2; k++){
//                            for (l=-1; l<2; l++) {
//                                $tempRow = $targRow + k;
//                                $tempCol = $targCol + l;
//                                //make sure it's within bounds
//                                if (($tempRow >= 0) && ($tempRow < 14) && ($tempCol >= 0) && ($tempCol <14)){
//                                    $tempRow = String.fromCharCode($tempRow + letter);
//                                    $tempCol = $tempCol + 1;
//                                    $possibleSqs.push($tempRow + $tempCol);
//                                }
//                            }
//                        }
//                        
//                        if ($accuracy == 1) {
//                            //.75 correct square, .25 one of the surrounding 9
//                            var $randNum = Math.floor(Math.random() * 4);
//                            if ($randNum < 3) {
//                                //reported square is accurate
//                            }
//                            else {
//                                var $randNum = Math.floor(Math.random() * $possibleSqs.length);
//                                $reportedSq = $possibleSqs[$randNum];
//                            }
//                        }
//                        else if ($accuracy == 2) {
//                            //pick one of these 9 randomly
//                            var $randNum = Math.floor(Math.random() * $possibleSqs.length);
//                            $reportedSq = $possibleSqs[$randNum];
//                        }
//                    }
//                        
//                    else if ($accuracy == 3) {
//                        //get 25 surrounding squares (less if near edge)
//                        //let's not do this one
//                        for (k=-2; k<3; k++){
//                            for (l=-2; l<3; l++) {
//                                $tempRow = $targRow + k;
//                                $tempCol = $targCol + l;
//                                //make sure it's within bounds
//                                if (($tempRow >= 0) && ($tempRow < 14) && ($tempCol >= 0) && ($tempCol <14)){
//                                    $tempRow = String.fromCharCode($tempRow + letter);
//                                    $tempCol = $tempCol + 1;
//                                    $possibleSqs.push($tempRow + $tempCol);
//                                }
//                            }
//                        }
//                        //pick one of these randomly
//                        var $randNum = Math.floor(Math.random() * $possibleSqs.length);
//                        $reportedSq = $possibleSqs[$randNum];
//                    }
//                    
//                    var $risk = $srcRisk[j];
//                    
//                    //think about populating this info on the spot instead of ahead of time, to mitigate some cheating
//                    if ($risk == "high"){
//                        $('#intel' + (j+1)).append('<p class = "hvtinfo" id = "info' + i +'">HVT' + (i+1) + ' sighted at <span id="span' + i + '">' + $reportedSq + '</span></p>');
//                    } else {
//                        $('#intel' + (j+1)).append('<p class = "hvtinfo" id = "info' + i +'">LVT' + (i+1) + ' sighted at <span id="span' + i + '">' + $reportedSq + '</span></p>');
//                    }                         
//                    
//                    $('#intel' + (j+1) + ' #info' + i).append('<button>Show</button>');
//                    $('#intel' + (j+1) + ' #info' + i).on('click', 'button', function() {
//                        
//                        //which hvt line is this?
//                        var $temphvt = $(this).parent().attr('id').substr(4);
//                        $hvts[$temphvt].status = "active";
//                                                
//                        //show location info, disable button in other intel box
//                        $('.intelTBs #info' + $temphvt).find('button').prop('disabled', true);
//                        $(this).hide();
//                        $(this).parent().find('span').fadeIn('fast');            
//                        
//                        $('.intelTBs #info' + $temphvt).not($(this).parent()).css('color', 'lightgray');
//                                            
//                        //depending on which source was clicked, assign whether hvt type is low or high value
//                        var $tempintel = $(this).parent().parent().attr("id").substr(5)-1;
//                        if ($intels[$tempintel].risk == "low"){
//                            $hvts[$temphvt].type = "low";
//                        } else {
//                            $hvts[$temphvt].type = "high";
//                        }
//                        
//                        var tempdataobj = {time: $elapsedTime, type: "choosesource", target: $temphvt, risk: $intels[$tempintel].risk, reportedSq: $(this).parent().find('span')[0].innerHTML}                                                                   
//                        data2 += "," + JSON.stringify(tempdataobj);
//                    });
//                    
//                }
//            }
//        } 
//        }
//    }, 1000);
//});
//

//
//
//
//
//
//function endGame() {
//    $('#captureTB').append('<p>Finished!</p>');
//    clearInterval(mytimer);
//}
//    
//
//
//    
//
//
//
//
