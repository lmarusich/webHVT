function startTutorial($frame) {
    
    $phase = "tutorial";
    var tempdataobj = {event: {type: "starttutorial1"}}
    console.log(JSON.stringify(tempdataobj));
    //submit(JSON.stringify(tempdataobj))
    
    if ($fasttrack1){
        $gotostep = 17;
    } else {
        $gotostep = 1
    }
    
    var ntargets = 1;
    
    //create tutorial hvts
    $hvts[0] = new target(74,1);
    $hvts[0].status = 'active';
    $hvts[0].type = 'high';

    tutorialtimer(ntargets);
    //remove clock (change this?)
    document.getElementById("time").style.display = "none";
    //create hard-coded tutorial intel
    $('#intel1').append('<p id="tutorialintel">HVT1 sighted at F5</p>');

    var sq74clicked = false;
    myintro = introJs();
        
    myintro.onafterchange(function(targetElement) {
        
        switch(targetElement.id) {
            case "":
                if (this._currentStep == 12){
                    $li1 = $("#cbPanel>ul>li").first();
                    if (!($li1.children('span').html().charCodeAt(0) == 10004 & $li1.children('span').hasClass('show'))){
                        myintro.previousStep();
                    }
                }
                
                break;
            case "tutorialintel":
                $('#tutorialintel').css('visibility','visible'); 
                break;
            case "sq74":
                if(this._currentStep == 5){
                    if (!$('#plt1').hasClass('highlight')){
                        myintro.previousStep();
                    } else if (!$('#sq74').hasClass('clickadded')){
                        //make it so that clicking the goal square moves on to the next step of the tutorial
                        $('#sq74').addClass('clickadded').on('click.tutorial',function() {

                            sq74clicked = true;
                            $('.introjs-tooltipbuttons').css('visibility','hidden');
                            myintro.nextStep();
                        });                
                    }
                }
                
                if(this._currentStep == 14){
                    stopPlt($plts[1],0,0,ntargets)
                    $('#sq74').addClass('tutorial1');
                   
                }
                break;
                
            case "mapPanel":
                if (!sq74clicked){
                    myintro.previousStep();
                }
                break;
            
            case "capturePanel":
                
                break;
                
            case "status":
                
                $('#sq74').off('click.tutorial');
                //start a platoon moving
                $plts[1].status = "moving";
                $plts[1].goalRow = "A";
                $plts[1].goalCol = 1;
                $plts[1].lastMoveTime = $elapsedTime;
                $('#plt2').fadeOut(0);
                startPlt($plts,1);       
                break;
                
            case "intel1":
                
                if(this._currentStep == 14){
                    stopPlt($plts[1],0,0,ntargets)
                }
                break;
                
            case "littleoverlay":
                    
                    
                if(this._currentStep == 15){
                                        
                    $('#sq74').addClass('tutorial1');
                    var surroundSqs = [59,60,61,73,75,87,88,89];
                    for (i=0; i<surroundSqs.length; i++){
                        $('#sq' + surroundSqs[i]).addClass('tutorial2');
                    }
                }
            }

    }).onexit(function() {
        clearInterval(myvar);
        startPractice();
        
}).setOptions({
            keyboardNavigation: false,
            exitOnOverlayClick: false,
            showBullets: false,
            steps: [
              { //0
                intro: '<p>Welcome!</p>Your task is to find and capture targets that have been spotted in the area.'
              },
                  
              { //1
                element: document.querySelector('#mapcontainer'),
                intro: 'This is the map'
              },
            {   //2
                element: document.querySelector('#intelPanel'),
                intro: 'This is where you get intel...'
            },
            {   //3
                element: document.querySelector('#tutorialintel'),
                intro: 'A potential target has been seen at F5'
            },
            {   //4
                element: document.querySelector('#sq90'),
                intro: 'This is one of four units you can assign to capture targets.<br>Click on it!'
            },
            {   //5
                element: document.querySelector('#sq74'),
                intro: 'Click on the map at F5 to send this unit to capture the target seen there.',
                position: 'right'
            },
                  
            {   //6
                element: document.querySelector('#mapPanel'),
                intro: "The yellow arrow shows the path your unit is taking to the assigned location.<br>Be patient!"
            },
            {   //7
                element: document.querySelector('#mapPanel'),
                intro: "If your unit encounters a potential target, it will automatically capture it and return to the central base location",
                position: 'right'
                                       
            },
            {   //8
                element: document.querySelector('#capturePanel'),
                intro: 'These Capture Reports will tell you if the individual you captured was actually a target, or if it was just a false alarm.'
            },
            {   //11
                element: document.querySelector('#scorePanel'),
                intro: 'Your total score will appear here'
            },
            {   //9
                element: document.querySelector('#cbPanel'),
                intro: 'Stay organized! Mark whether you captured or missed each target'
            },
            {   //10
                element: document.querySelector('li'),
                intro: 'Mark this target as captured',
                position: 'left'
            },

            {   //12
                title: 'Great job!',
                element: document.querySelector('.card__image'),
                intro: 'Here are a few more tips.'
            },
            {   //13
                element: document.querySelector('#status'),
                intro: "You can stop a unit as it's traveling if you need to reassign it.",
                position: 'right'
            },
            {   //14
                element: document.querySelector('#sq74'),
                intro: 'The potential target is 50% likely to be at the location indicated by the intelligence report',
                position:'top'
            },
            {   //15
                element: document.querySelector('#littleoverlay'),
                intro: 'If not, it will be in one of the immediately surrounding squares</p>',
                position:'top'
            },
            {   //16
                element: document.querySelector('.card__image'),
                intro: "Great! Now let's practice"
            }]
        }).start().goToStep($gotostep);
        //.goToStep(0);
//        .goToStep(14); 
    
    }