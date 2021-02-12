function startTutorial() {
    
    
    //create tutorial timer
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
                        if ($plts[i].status == "returning"){
                             $('.introjs-tooltipbuttons').css('visibility','visible');
                            myintro.nextStep()
                        }

                        $score = stopPlt($plts,i,$score,$maxScore);

                    }
                }
            }

            if (($plts[i].status == "moving") || ($plts[i].status == "stopped")) {
                //check to see if the tutorial target is captured
                j = 0;


                if ($hvts[j].status == "active") {             
                    if (getSq($plts[i].currentRow+$plts[i].currentCol) == $hvts[j].loc){  
                        //capture or false alarm                        
                        //current hvt is "j"

                        var $capture = 1;
                        var $hvtType = "HVT ";


                        if ($capture > 0) {
                            $hvts[j].status = "captured";


                            if ($hvts[j].type == "low") {
                                $plts[i].points = $lvtPoints;

                            } else if ($hvts[j].type == "high") {
                                if ($frame == "+"){
                                    $plts[i].points = $hvtPoints;
                                }
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
                            $score = stopPlt($plts,i,$score,$maxScore);
                        }
                        $plts[i].status = "returning";
                        var $goalSq = parseInt($plts[i].homeSq.substr(3)) + 1;
                        $plts[i].goalRow = getCoords($goalSq).substr(0,1);
                        $plts[i].goalCol = parseInt(getCoords($goalSq).substr(1));
                        $plts[i].lastMoveTime = $elapsedTime;
                        $('#plt' + (i+1)).fadeOut(0);
                        startPlt($plts,i);
                        myintro.nextStep();
                        break
                    }
                } 
            }
        }
    }, 1000)};

    //create tutorial hvts
    $hvts[0] = new target(74,1);
    $hvts[0].status = 'active';
    $hvts[0].type = 'high';

    tutorialtimer();
    //remove clock (change this?)
    document.getElementById("time").style.display = "none";
    //create hard-coded tutorial intel
    $('#intel1').append('<p id="tutorialintel">HVT1 sighted at F5</p>');

    var sq74clicked = false;
    var myintro = introJs();
        
    myintro.onafterchange(function(targetElement) {
        
        switch(targetElement.id) {
            case "scorePanel":
                $li1 = $("#cbPanel>ul>li").first();
                console.log($li1);
                if (!($li1.children('span').html().charCodeAt(0) == 10004 & $li1.children('span').hasClass('show'))){
                    myintro.previousStep();
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
                    stopPlt($plts,1,0,0)
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
                console.log(this._currentStep)
                if(this._currentStep == 14){
                    stopPlt($plts,1,0,0)
                    
//                    var surroundSqs = [59,60,61,73,75,87,88,89];
//                    for (i=0; i<surroundSqs.length; i++){
//                        $('#sq' + surroundSqs[i]).addClass('tutorial2');
//                    }
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



}).onexit(function(){
        console.log('its over')
        
        
        
    }).setOptions({
        
            exitOnOverlayClick: false,
            showBullets: false,
          steps: [
              { 
                title: 'Welcome!',
                intro: 'Your task is to find and capture targets that have been spotted in the area.'
              },
                  
              {
                element: document.querySelector('#mapcontainer'),
                intro: 'This is the map'
              },
            {
                element: document.querySelector('#intelPanel'),
                intro: 'This is where you get intel...'
            },
            {
                element: document.querySelector('#tutorialintel'),
                intro: 'A potential target has been seen at F5'
            },
            {
                element: document.querySelector('#sq90'),
                intro: 'This is one of four units you can assign to capture targets.<br>Click on it!'
            },
            {
                element: document.querySelector('#sq74'),
                intro: 'Click on F5 to send this unit to capture the target seen there.',
                position: 'right'
            },
                  
            {
                element: document.querySelector('#mapPanel'),
                intro: "The yellow arrow shows the path your unit is taking to the assigned location.<br>Be patient!"
            },
            {
                element: document.querySelector('#mapPanel'),
                intro: "If your unit encounters a potential target, it will automatically capture it and return to the central base location",
                position: 'right'
                                       
            },
            {
                element: document.querySelector('#capturePanel'),
                intro: 'Here is where you see if you captured a target, or if it was a false alarm...'
            },
            {
                element: document.querySelector('#cbPanel'),
                intro: 'Stay organized! Mark whether you captured or missed each target...'
            },
            {
                element: document.querySelector('li'),
                intro: 'Mark this target as captured',
                position: 'left'
            },
            {
                element: document.querySelector('#scorePanel'),
                intro: 'Your total score will appear here'
            },
            {
            title: 'Great job!',
            element: document.querySelector('.card__image'),
            intro: 'Here are a few more tips.'
          },
          {
                element: document.querySelector('#status'),
                intro: "You can stop a unit as it's traveling if you need to reassign it.",
              position: 'right'
            },
          {
                element: document.querySelector('#sq74'),
                intro: 'The potential target is 50% likely to be at the location indicated by the intelligence report',
              position:'top'
              },
                    {
                element: document.querySelector('#littleoverlay'),
                intro: 'If not, it will be in one of the immediately surrounding squares</p>',
              position:'top'
              }]
        }).start();
//        .goToStep(13);
    
    
    
    
    }