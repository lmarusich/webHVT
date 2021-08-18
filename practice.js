gainsheading = [': HVTs (+2/+0)', ': LVTs (+1)'];
lossheading = [': HVTs (-2/-0)', ': LVTs (-1)'];

generictext = [
    'Great job!',
    [
        'There will be a number of <b>HIGH</b> value targets (HVTs) in the area that you can find and capture. Capturing an HVT adds 2 points to your score.',
        'There will be a number of <b>HIGH</b> value targets (HVTs) escaping the area that you can find and capture. An escaped HVT subtracts 2 points from your score.'
    ],
    'One intel source provides information about the location of HVTs.',
    [
        'Capturing an HVT is worth two <b>(+2)</b> points, but there is a risk of false alarms, where you will earn no <b>(+0)</b> points.',
        'If you capture an HVT, you will not lose any points <b>(-0)</b>, but there is a risk of false alarms, where you will lose two <b>(-2)</b> points.'
    ],
    'The other intel source provides information about the location of <b>LOW</b> value targets (LVTs).',
    [
        'Instead of an HVT, you can choose to capture an LVT, which is worth 1 <b>(+1)</b> point.',
        'Instead of an HVT, you can choose to capture an LVT, and only lose one <b>(-1)</b> point.'
    ],
    "Let's practice choosing between the two sources of intel",
    'You are able to choose to see location information about an HVT or an LVT',
    'Click on this button to show information about the HVT',
    'Assign a unit to capture this HVT',
    [
        'You earned 2 points for capturing this HVT.',
        'You did not lose any points because you captured this HVT.'  
    ],
    'Now you can make another choice between an HVT and an LVT',
    'Choose the HVT again',
    'Assign a unit to capture this HVT',
    [
        'You earned 0 points because this turned out to be a false alarm, and the HVT escaped.',
        'You lost 2 points because this turned out to be a false alarm, and the HVT escaped.' 
    ],
    'Now choose the LVT',
    'Assign a unit to capture this LVT',
    [
        'You earned 1 point for capturing this LVT.',
        'You only lost 1 point because you captured an LVT.'
    ],
    'Choose the LVT again',
    'Assign a unit to capture this LVT',
    [
        'You earned 1 point for capturing this LVT.',
        'You only lost 1 point because you captured an LVT.'
    ],
    "Great! Now let's do one more practice run all on your own."
];

timertext = "This timer will record how long it takes you to complete the task."


gainstext = [];
losstext = [];
for (var i = 0; i < generictext.length; i++) {
    if(Array.isArray(generictext[i])){
       gainstext[i] = generictext[i][0];
       losstext[i] = generictext[i][1];
    } else {
       gainstext[i] = generictext[i];
       losstext[i] = generictext[i];
    }
} 

function startPractice() {
    
    $phase = "practice"
    var tempdataobj = {event: {type: "startpractice1"}}
    console.log(JSON.stringify(tempdataobj));
    //submit(JSON.stringify(tempdataobj))

    var ntargets = 2;
    
    //reset from tutorial
    resetAll($frame, ntargets);
    
    //create practice hvts
    var $practicelocs  = [30, 49, 125, 150]
    //quick hvts
    var $practicelocs  = [88,146,76,77];
    
    //make array of 4 targets
    for (i=0; i<4; i++){    
        var $temptime = i*hvtInterval + $startTime;//maybe make start time less than 5 for practice? idk
        $hvts[i] = new target($practicelocs[i],$temptime);
    }
    
    
    //make array of 1 intel group for practice
    for (i=0; i<1; i++){
        $intels[i] = new Intel(i,[3,99],'high');
    }
    
    testtimer(ntargets,"practice");
    
}

function tutorial2(){
    
    $phase = 'practice2';
    var tempdataobj = {event: {type: "starttutorial2"}}
    console.log(JSON.stringify(tempdataobj));
    //submit(JSON.stringify(tempdataobj))
    
    if ($fasttrack2){
        $gotostep = 21;
    } else {
        $gotostep = 1
    }
    
    
    var introtext = gainstext;
    var headingtext = gainsheading;
    if ($frame == "-"){
        introtext = losstext;
        headingtext = lossheading;
    }

    if ($timepressure){
        timertext = "This timer will show how long you have to complete the task. It will turn red when you have 2 minutes left."
    }
    
    var ntargets = 4;
    resetAll($frame, ntargets);
    
    //time to assign intel box risk values (for 2nd practice, make target appear on reported square)
    for (i=0; i<2; i++){
        $intels[i] = new Intel(i,3,$srcRisk[i]);
    }
    
    var whichHigh = $srcRisk.indexOf('high') + 1;    
    var whichLow = $srcRisk.indexOf('low') + 1;
        
    //create practice hvts
    var $practicelocs  = [30, 49, 125, 150]
    //make array of 4 targets
    for (i=0; i<4; i++){    
        var $temptime = i*hvtInterval + $startTime;//maybe make start time less than 5 for practice? idk
        $hvts[i] = new target($practicelocs[i],$temptime);
        
        populateIntel($intels[whichHigh-1],whichHigh-1,i,getCoords($practicelocs[i]+1));
        populateIntel($intels[whichLow-1],whichLow-1,i,getCoords($practicelocs[i]+1));
    
    }
    
    $('p.hvtinfo button').addClass('clickadded').on('click.tutorial',function() {
        myintro2.nextStep();
    }); 
    
    $('p.hvtinfo').css('visibility','hidden');
    
    myintro2 = introJs();
           
    myintro2.onafterchange(function(targetElement){
        if (targetElement.id == 'intel' + whichHigh && this._currentStep == 3){
            if ($('#intel' + whichHigh + '>H4').html().length < 12){
                $('#intel' + whichHigh + '>H4').html($('#intel' + whichHigh + '>H4').html() + headingtext[0]);
            }
            
        } else if (targetElement.id == 'intel' + whichLow && this._currentStep == 5){
            if ($('#intel' + whichLow + '>H4').html().length < 12){
                    $('#intel' + whichLow + '>H4').html($('#intel' + whichLow + '>H4').html() + headingtext[1]);
            }
           
        } else if (targetElement.id == 'intelPanel'){
            //disable buttons?
            if (this._currentStep == 7){
                $('p.hvtinfo#info0').css('visibility','visible');
            } else if (this._currentStep == 11){
                $('p.hvtinfo#info1').css('visibility','visible');
            }
            $('p.hvtinfo button').prop('disabled', true);
            
        } else if (this._currentStep == 8){
            //enable buttons?
            $('.introjs-tooltipbuttons').css('visibility','hidden');
            //only enable appropriate button
            $('p.hvtinfo button').prop('disabled', false);
            var ntargets = 4;
            tutorialtimer(ntargets);
            
        }else if (targetElement.id == 'mapcontainer'){           
            //$('.introjs-tooltipbuttons').css('visibility','hidden');          
        }else if (targetElement.id == 'littleoverlay2'){           
            $('.introjs-tooltipbuttons').css('visibility','visible');          
        } else if (this._currentStep == 12 || this._currentStep == 15 || this._currentStep == 18){
            $('.introjs-tooltipbuttons').css('visibility','hidden');    
            if (this._currentStep == 12){
                $('#info1 button').prop('disabled', false);
            } else if (this._currentStep == 15){
                $('#info2 button').prop('disabled', false);
                $('p.hvtinfo#info2').css('visibility','visible');
            } else if (this._currentStep == 18){
                $('#info3 button').prop('disabled', false);
                $('p.hvtinfo#info3').css('visibility','visible');
            } 
        } else if (this._currentStep == 22){
            //make the timer visible
            //need to set time first (0 for no time pressure, whatever time limit is for practice)
            var ntargets = 4;
            if ($timepressure){
                $timelimit = ntargets * 60;
            }
            //reset from tutorial
            resetAll($frame, ntargets);
            timer(-1,ntargets)
            //show clock
            document.getElementById("time").style.display = "block";
            console.log('show timer')
        }
        
        
    }).onexit(function() {
//        clearInterval(myvar);
        startBigPractice();
}).setOptions({
            keyboardNavigation: false,
            exitOnOverlayClick: false,
            showBullets: false,
            steps: [
                {intro: introtext[0]},
                {title: 'More Info', intro: introtext[1]},
                {element: document.querySelector('#intel' + whichHigh), intro: introtext[2]},
                {element: document.querySelector('#intel' + whichHigh), intro: introtext[3]},
                {element: document.querySelector('#intel' + whichLow),  intro: introtext[4]},
                {element: document.querySelector('#intel' + whichLow), intro: introtext[5]},        
                {intro: introtext[6]},
                {element: document.querySelector('#intelPanel'),intro: introtext[7]},
                {element: document.querySelector('#intel' + whichHigh + ' #info0'),intro: introtext[8]},
                {element: document.querySelector('#mapcontainer'),intro: introtext[9]},
                {element: document.querySelector('#littleoverlay2'),intro: introtext[10]},
                {element: document.querySelector('#intelPanel'),intro: introtext[11]},
                {element: document.querySelector('#intel' + whichHigh + ' #info1'),intro: introtext[12]},
                {element: document.querySelector('#mapcontainer'),intro: introtext[13]},
                {element: document.querySelector('#littleoverlay2'),intro: introtext[14]},
            {
                element: document.querySelector('#intel' + whichLow + ' #info2'),
                intro: introtext[15]
          },
                {
                element: document.querySelector('#mapcontainer'),
                intro: introtext[16]
          },
                {
                element: document.querySelector('#littleoverlay2'),
                intro: introtext[17] 
          },
            
            {
                element: document.querySelector('#intel' + whichLow + ' #info3'),
                intro: introtext[18]
          },
                {
                element: document.querySelector('#mapcontainer'),
                intro: introtext[19]
          },
                {
                element: document.querySelector('#littleoverlay2'),
                intro: introtext[20]
                
          },
           {intro: introtext[21]},
           {
               element: document.querySelector('header'),
               intro: timertext} 
            ]
        }).start().goToStep($gotostep);
        //.goToStep(8);
    
    }

function startBigPractice(){
    
    $phase = "bigpractice"
    var tempdataobj = {event: {type: "startbigpractice"}}
    console.log(JSON.stringify(tempdataobj));
    //submit(JSON.stringify(tempdataobj))
    var ntargets = 4;

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
       


    function endBigPractice(endmsg){
    
        if (endmsg == "outoftime"){
            message = "You ran out of time!"
        } else {
            message = "You finished the practice!"
        }
       
           
        myintro3 = introJs();
               
        myintro3.onafterchange(function(targetElement){      
            
        }).onexit(function() {
            startRealTest();
    
    }).setOptions({
                keyboardNavigation: false,
                exitOnOverlayClick: false,
                showBullets: false,
                doneLabel: 'Next',
                steps: [
                    {intro: message},
                    {intro: "Press 'Next' to begin your first real block"}
    
                ]
            }).start();   
        }
        
function endRealTest(endmsg){
    
    if (endmsg == "outoftime"){
        message = "You ran out of time!"
    } else {
        message = "You finished!"
    }
   
       
    myintro4 = introJs();
           
    myintro4.onafterchange(function(targetElement){      
        
    }).onexit(function() {
        //do demographics, berlin numeracy, free response
        document.getElementById("overlay").style.display = "block";
        document.getElementById("resume").style.display = "none";
        document.getElementById("questionnaires").style.display = "block";
        onLoad();
        document.getElementById("nasatlx").style.display = "block";

}).setOptions({
            keyboardNavigation: false,
            exitOnOverlayClick: false,
            showBullets: false,
            steps: [
                {intro: message},
            ]
        }).start();   
    }