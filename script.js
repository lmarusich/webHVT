//test variables
var $phase = "tutorial";
var $timepressure = false;
var $timeunits = 1000;
var $frame = "+";
var $fasttrack1 = false;
var $fasttrack2 = false;
var $fasttrack2b = false;
var $fasttrack3 = false;
var $fasttrack4 = false;
var $fasttrack5 = false;
//timelimit 10 min?
var $timelimit = 10 * 60;
var $outoftime = false;
var $nHvts = 15;
var $startTime = 5;
var hvtInterval = 15; //time between successive targets
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

$(document).ready(function(){

    $('#consentbutton').on('click',function() {
        $('#consentdiv').hide();
        $('#frameoptions').show();
    });
    
    //get framing condition
    $('#framingbutton').on('click',function() {
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

        if(document.getElementById("fasttrack4").checked){
            $timeunits = 100;
        }

        if(document.getElementById("fasttrack5").checked){
            $fasttrack5 = true;
        }

        //write out conditions to data?
        //browser info here?
        var tempdataobj = {
            session: {
                framing: $frame,
                timepressure: $timepressure
        }};
        console.log(JSON.stringify(tempdataobj));
        //submit(JSON.stringify(tempdataobj))
  
        
        //reset progress bar text and height
        $('#scorePanel h3').html("Score: " + $score + "/" + $maxScore);
        $('#scorePanel #prog').css('height',($score/$maxScore*100)+'%');
        
        
        document.getElementById("frameoptions").style.display = "none";
        document.getElementById("overlay").style.display = "none";
        document.getElementById("resume").style.display = "inline";
        //adjust height and location of elements based on window size
        changeHeight();
        
        //need to disable resizing if tutorial is running?
        if(document.getElementById("fasttrack5").checked){
            endRealTest();
        } else if(document.getElementById("fasttrack3").checked){
            startRealTest();
        } else if(document.getElementById("fasttrack2b").checked){
            startBigPractice();
        } else {
            startTutorial($frame);
        }
        
        
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

        $('#cbPanel ul').append('<li><span>&#10004</span><button class="hvtCB">Target ' + (i + 1) + '&nbsp&#9660</button><div class = "dropdowncontent"><a href = "#" class = "p-active disabled">Active</a><a href = "#" class = "p-captured">Captured</a><a href = "#" class = "p-missed">False alarm</a></div></li>'); 
    }
    
    
    $(document).on('click','#cbPanel button',function(){
        $(this).parent().find('.dropdowncontent').toggleClass('show');
    });
    
    
    //change appearance when a dropdown item is selected
    $(document).on('click','#cbPanel a',function(){
        //if clicked on "captured" add a check
        //if clicked on "missed" add an x
        //if clicked on "active" remove all that 
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
        
        var tempdataobj = {event:{phase: $phase, time: $elapsedTime, type: "marktarget", target: $('#cbPanel li').index($(this).parent().parent()), mark: $(this).attr('class')} }
        console.log(tempdataobj)
        //submit(JSON.stringify(tempdataobj))
        
        $(this).addClass('disabled');
   
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
                    
                    var tempdataobj = {event: {phase: $phase, time: $elapsedTime, type: "assignunit", unit: $whichPlt-1, currentSq: $plts[$whichPlt - 1].currentRow + $plts[$whichPlt - 1].currentCol, goalSq: $goalSq}}
                    console.log(JSON.stringify(tempdataobj));
                    //submit(JSON.stringify(tempdataobj))
                                                  
                    //check for hidden units in same square, make them visible
                    if (($currSq).children('.plt.hidden').length > 0) {
                        $currSq.children('.plt.hidden').first().toggleClass('hidden');
                    }
                });                
            }
        }
    });
       
    $('#status button').on('click',function() {
        var whichPlt = parseInt($(this).parent().attr('id').substr(6))-1;
        var tempdataobj = {event: {phase: $phase, time: $elapsedTime, type: "stopunit", unit: whichPlt, currentSq: $plts[whichPlt].currentRow + $plts[whichPlt].currentCol}};
        console.log(JSON.stringify(tempdataobj));
        //submit(JSON.stringify(tempdataobj))
        $score = stopPlt($plts[whichPlt],whichPlt,$score,$maxScore);
    });
    
    //define pause button
    $('#pause').on('click',function() {
        $isPaused = true;
        
        var tempdataobj = {event: {phase: $phase, type: "pause"}};
        console.log(JSON.stringify(tempdataobj));
        //submit(JSON.stringify(tempdataobj))
        document.getElementById("overlay").style.display = "block";
    });
    
    //define resume button
    $('#resume').on('click',function() {
        $isPaused = false;
        var tempdataobj = {event: {phase: $phase, type: "resume"}};
        console.log(JSON.stringify(tempdataobj));
        //submit(JSON.stringify(tempdataobj))
        document.getElementById("overlay").style.display = "none";
    });

    //prevent form submission on pressing enter
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
          event.preventDefault();
          return false;
        }
      });    

    //define questionnaire buttons
    $('.questionnairebutton').on('click',function(){

        if(this.id == "nasatlxbutton"){
            // Check to be sure they click on every scale
            for (var i = 0; i < NUM_SCALES; i++){
                if (!results_rating[i]){
                    alert('A value must be selected for every scale!');
                    return false;
                }
            }
            
            output = results_rating;

        } else{
        
            $myForm = $(this).prevAll('form');
            if(! $myForm[0].checkValidity()) {
                // If the form is invalid, submit it. The form won't actually submit;
                // this will just cause the browser to display the native HTML5 error messages.
                $myForm.find(':submit').click();
                return;
            }
                      
            var formid = $(this).prevAll('form').attr('id');
    
            //need to check what kind of question it is. if radio, the following. if something else, etc.
            if ($myForm.hasClass('radioform')){
                $formname = $myForm[0][0].name;
                output = $('input[name=' + $formname + ']:checked', '#' + formid).val();
            } else if($myForm.hasClass('textareaform')){
                output = $myForm.children('textarea').val();
            } else {
                output = $myForm.children('input[type=number]').val();
            }
        }
            
            console.log(output)
            var tempdataobj = {questionnaireoutput: {type: $(this).parent('div').attr('id'), response: output}}
            console.log(JSON.stringify(tempdataobj));
            //submit(JSON.stringify(tempdataobj))
        //need to log the data here

        //if last form, end task for real
        //else, go to next form

        //hide current div, show next div
        if(typeof output !== "undefined"){
            var currentdiv = $(this).closest('div');
            console.log(currentdiv.attr('id'));

            currentdiv.hide().next().show();

        }  
    
    });
    
   
});
    
    





