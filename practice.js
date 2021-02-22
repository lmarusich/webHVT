gainsheading = [': HVTs (+2/+0)', ': LVTs (+1)'];
lossheading = [': HVTs (-2/-0)', ': LVTs (-1)'];

gainstext = [
    'Great job!',
    'There will be a number of <b>HIGH</b> value targets (HVTs) in the area that you can find and capture. Capturing an HVT adds 2 points to your score.',
    'One intel source provides unreliable information about the location of HVTs.',
    'Capturing an HVT is worth two (+2) points, but there is a risk of false alarms, where you will earn no (+0) points.',
    'The other intel source provides very reliable information about the location of LOW value targets (LVTs).',
    'Instead of an HVT, you can choose to capture an LVT, which is worth 1 point.',
     "Let's practice choosing between the two sources of intel",
     'You are able to choose to see location information about an HVT or an LVT',
     'Click on this button to show information about the HVT',
     'Assign a unit to capture this HVT',
    'You earned 2 points for capturing this HVT.',
     'Now you can make another choice between an HVT and an LVT',
     'Choose the HVT again',
    'Assign a unit to capture this HVT',
        'You earned 0 points because this turned out to be a false alarm.',
         'Now choose the LVT',
       'Assign a unit to capture this LVT',
     'You earned 1 point for capturing this LVT.',
      'Choose the LVT again',
       'Assign a unit to capture this LVT',
       'You earned 1 point for capturing this LVT.'
]

losstext = [
    'Great job!',
    'There will be a number of <b>HIGH</b> value targets (HVTs) escaping the area that you can find and capture. An excaped HVT subtracts 2 points from your score.',
    'One intel source provides unreliable information about the location of HVTs.',
    'If you capture an HVT, you will not lose any points (-0), but there is a risk of false alarms, where you will lose two (-2) points.',
    'The other intel source provides very reliable information about the location of LOW value targets (LVTs).',
    'Instead of an HVT, you can choose to capture an LVT, and only lose one (-1) point.',
     "Let's practice choosing between the two sources of intel",
     'You are able to choose to see location information about an HVT or an LVT',
     'Click on this button to show information about the HVT',
     'Assign a unit to capture this HVT',
    'You did not lose any points because you captured this HVT.',
     'Now you can make another choice between an HVT and an LVT',
     'Choose the HVT again',
    'Assign a unit to capture this HVT',
        'You lost 2 points because this turned out to be a false alarm, and the HVT escaped.',
         'Now choose the LVT',
       'Assign a unit to capture this LVT',
     'You only lost 1 point because you captured an LVT.',
      'Choose the LVT again',
       'Assign a unit to capture this LVT',
       'You only lost 1 point because you captured an LVT.'
]

function startPractice() {
    
    $phase = "practice"
    var ntargets = 2;
    
    //reset from tutorial
    resetAll($frame, ntargets);
    
    //create practice hvts
    var $practicelocs  = [30, 49, 125, 150]
    //quick hvts
    var $practicelocs  = [88,77,76,77];
    
    //make array of 4 targets
    for (i=0; i<4; i++){    
        var $temptime = i*hvtInterval + $startTime;//maybe make start time less than 5 for practice? idk
        $hvts[i] = new target($practicelocs[i],$temptime);
    }
    
    
    //make array of 1 intel group for practice
    for (i=0; i<1; i++){
        $intels[i] = new Intel(i,[3,4],'high');
    }
    
    
    testtimer(ntargets,"practice");
    
}

function tutorial2(){
    
    console.log('starting tutorial2???');
    
    $phase = 'practice2';
    
    var introtext = gainstext;
    var headingtext = gainsheading;
    if ($frame == "-"){
        introtext = losstext;
        headingtext = lossheading;
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
        console.log(this._currentStep);
        if (targetElement.id == 'intel' + whichHigh && this._currentStep == 3){
            $('#intel' + whichHigh + '>H4').html($('#intel' + whichHigh + '>H4').html() + headingtext[0]);
        } else if (targetElement.id == 'intel' + whichLow && this._currentStep == 5){
           $('#intel' + whichLow + '>H4').html($('#intel' + whichLow + '>H4').html() + headingtext[1]);
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
            $('p.hvtinfo button').prop('disabled', false);
            tutorialtimer(ntargets,myintro2);
            
        }else if (targetElement.id == 'mapcontainer'){           
            //$('.introjs-tooltipbuttons').css('visibility','hidden');          
        }else if (targetElement.id == 'capturePanel'){           
            $('.introjs-tooltipbuttons').css('visibility','visible');          
        } else if (this._currentStep == 12 || this._currentStep == 15 || this._currentStep == 18){
            $('.introjs-tooltipbuttons').css('visibility','hidden');   
            $('p.hvtinfo button').prop('disabled', false);
            if (this._currentStep == 15){
                $('p.hvtinfo#info2').css('visibility','visible');
            } else if (this._currentStep == 18){
                $('p.hvtinfo#info3').css('visibility','visible');
            }
        }
        
        
    }).onexit(function() {
//        clearInterval(myvar);
//        startPractice($frame);
        console.log('2nd tutorial over');
}).setOptions({
            keyboardNavigation: false,
            exitOnOverlayClick: false,
            showBullets: false,
            steps: [
                {intro: introtext[0]},
                {title: 'More Info', intro: introtext[1]},
                {element: document.querySelector('#intel' + whichHigh), intro: introtext[2]},
            {
                element: document.querySelector('#intel' + whichHigh),
                intro: introtext[3]
            },
            {
                element: document.querySelector('#intel' + whichLow),
                intro: introtext[4]
            },
            {
                element: document.querySelector('#intel' + whichLow),
                intro: introtext[5]
            },
            
            {
            
            //element: document.querySelector('.card__image'),
            intro: introtext[6]
            },
                {
                element: document.querySelector('#intelPanel'),
                intro: introtext[7]
          },
            {
                element: document.querySelector('#intel' + whichHigh + ' #info0'),
                intro: introtext[8]
          },
            {
                element: document.querySelector('#mapcontainer'),
                intro: introtext[9]
          },
                {
                element: document.querySelector('#capturePanel'),
                intro: introtext[10]      
          },
        {
                element: document.querySelector('#intelPanel'),
                intro: introtext[11]
          },
            {
                element: document.querySelector('#intel' + whichHigh + ' #info1'),
                intro: introtext[12]
          },
                {
                element: document.querySelector('#mapcontainer'),
                intro: introtext[13]
          },
                {
                element: document.querySelector('#capturePanel'),
                intro: introtext[14]
                
          },
            {
                element: document.querySelector('#intel' + whichLow + ' #info2'),
                intro: introtext[15]
          },
                {
                element: document.querySelector('#mapcontainer'),
                intro: introtext[16]
          },
                {
                element: document.querySelector('#capturePanel'),
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
                element: document.querySelector('#capturePanel'),
                intro: introtext[20]
                
          }]
        }).start();
        //.goToStep(8);
    
    }
       
