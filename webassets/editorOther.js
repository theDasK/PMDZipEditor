var posibleNames = ["Walk","Attack","Strike","Shoot","Strike","Sleep","Hurt","Idle","Swing","Double","Hop","Charge","Rotate","EventSleep","Wake","Eat","Tumble","Pose","Pull","Pain","Float","DeepBreath","Nod","Sit","LookUp","Sink","Trip","Laying","LeapForth","Head","Cringe","LostBalance","TumbleBack","Faint","HitGround","Special1"];
var DIRNAMES = ["Down","Down Right","Right","Up Right","Up","Up Left","Left","Down Left"];

function cloneObj (obj){ //Ok, js, are you OOP or not?

    return JSON.parse(JSON.stringify(obj));
}

//Adds an entry to the error tracker
function addWarning (severity,category,msg){
    let entry = {
        'severity': severity,
        'category': category,
        'msg': msg
    }

    for (let i in activeErrors) if (activeErrors[i] == entry) return;

    activeErrors.push(entry);
    populateWarnings();
}

//categories: sprite offsets shadow animation frames xml zip
function clearWarnings (category = false){

    if (!category){
        activeErrors = [];
        return;
    }
    let temp = [];
    for (let i in activeErrors) if (activeErrors[i]['category'] != category) temp.push(activeErrors[i]);
    activeErrors = temp;
}

function populateWarnings(){

    container = document.getElementById("containerWarnings");
    container.innerHTML = "";

    for (let i in activeErrors){
        let li = document.createElement("li");
        li.innerHTML = activeErrors[i].severity + "("+activeErrors[i].category+"): " + activeErrors[i].msg;
        li.setAttribute("class", "li" + activeErrors[i].severity);
        container.appendChild(li);
    }
}

//this one gonna be big ¬¬
function reescanWarnings(){

}

//Compares all sprites and copy the pointers to the offsets to the copies
function copyOffsets (){

    stopDraw();
    progressBarSetMax (Object.keys(wPMDSprite.anims).length, true, "Finding duplicate sprites")
    progressBarHide (false);

    let checked = [];
    let checkedOffset = [];
    for (let i in wPMDSprite.anims){
        for (let k in wPMDSprite.anims[i].frames){
            for (let j in wPMDSprite.anims[i].frames[k]){
                let b64 = wPMDSprite.anims[i].frames[k][j].sprite.toDataURL();
                if (checked.includes(b64)){
                    let idx = checked.indexOf(b64)
                    wPMDSprite.anims[i].frames[k][j].offsetsr = checkedOffset[idx][0];
                    wPMDSprite.anims[i].frames[k][j].offsetsg = checkedOffset[idx][1];
                    wPMDSprite.anims[i].frames[k][j].offsetsb = checkedOffset[idx][2];
                    wPMDSprite.anims[i].frames[k][j].offsetsk = checkedOffset[idx][3];
                } else {
                    checked.push(b64);
                    checkedOffset.push([wPMDSprite.anims[i].frames[k][j].offsetsr,
                        wPMDSprite.anims[i].frames[k][j].offsetsg,
                        wPMDSprite.anims[i].frames[k][j].offsetsb,
                        wPMDSprite.anims[i].frames[k][j].offsetsk
                    ]);
                }
            }
        }
    }
    progressBarIncrease ("Finding duplicate sprites");
    progressBarHide (true);
}