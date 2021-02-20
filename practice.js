function startPractice(tutorial2) {
    
    $phase = "practice"
    var ntargets = 2;
    
    //reset from tutorial
    resetAll($frame, ntargets);
    
    //create practice hvts
    var $practicelocs  = [30, 49, 125, 150]
    
    //make array of 4 targets
    for (i=0; i<4; i++){    
        var $temptime = i*hvtInterval + $startTime;//maybe make start time less than 5 for practice? idk
        $hvts[i] = new target($practicelocs[i],$temptime);
    }
    
    
    //make array of 1 intel group for practice
    for (i=0; i<1; i++){
        $intels[i] = new Intel(i,[3,4],'high');
    }
    
    //need to figure out how to trigger end of practice
    testtimer(ntargets,"practice");
    
}

function tutorial2(){
    console.log('starting tutorial2???');
    
    var ntargets = 2;
    
    resetAll($frame, ntargets);
    
    var myintro2 = introJs();
        
    myintro2.onexit(function() {
//        clearInterval(myvar);
//        startPractice($frame);
        console.log('2nd tutorial over');
}).setOptions({
            keyboardNavigation: false,
            exitOnOverlayClick: false,
            showBullets: false,
            steps: [
                {
                    element: document.querySelector('#scorePanel'),
                    intro: 'Great job!'
                },
              { 
                title: 'More Info',
                intro: 'There will be a number of <b>HIGH</b> value targets (HVTs) in the area that you can find and capture. Capturing an HVT adds 2 points to your score.'
              },
                  
              
            {
                element: document.querySelector('#intelPanel'),
                intro: 'One intel source provides unreliable information about the location of HVTs. Capturing an HVT is worth two (+2) points, but there is a risk of false alarms, where you will earn no (+0) points.'
            },
            {
                element: document.querySelector('#intelPanel'),
                intro: 'The other intel source provides very reliable information about the location of LOW value targets (LVTs). Instead of an HVT, you can choose to capture an LVT, which is worth 1 point.'
            },
            
            {
            
            element: document.querySelector('.card__image'),
            intro: "Let's practice choosing between the two sources of intel"
          }]
        }).start();
    
    }
//    
//    //i guess i should randomize the order of the intel boxes once for the whole session
//    //present it that way here and throughout
//    
//    //talk about 2 sources of intel
//    //gains:
//        
//    
//        //there are a number of HIGH value targets (HVTs) in the area that you can find and capture. Capturing an HVT adds 2 points to your score.
//    
//        //one intel source provides unreliable information about the location of HVTs. Capturing an HVT is worth two points, but there is a risk of false alarms, where you will earn 0 points.
//    
//        //the other intel source provides very reliable information about the location of LOW value targets (LVTs). Instead of an HVT, you can choose to capture an LVT, which is worth 1 point.
//    
//    //losses:
//    
//        //there are a number of HIGH value targets (HVTs) escaping from the area. An escaped HVT subtracts 2 points from your score. 
//    
//        //one intel source provides unreliable information about the location of HVTs. If you capture an HVT you will not lose any points (-0), but there is a risk of false alarms, where you will lose two (-2) points.
//    
//        //the other intel source provides very reliable information about the location of LOW value targets (LVTs). Instead of an HVT, you can choose to capture an LVT, and only lose one (-1) point.
//    
//
//    
//        
