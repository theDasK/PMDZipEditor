function fillSelect(){
    
    document.getElementById('selectAnim').innerHTML = "";

    iterable = Object.keys(wPMDSprite['anims']);
    for (i in iterable){

        if(iterable[i] == "length") continue;

        let option = document.createElement("option");
        option.innerHTML = iterable[i];
        option.setAttribute("value", iterable[i]);
        document.getElementById('selectAnim').appendChild(option);
    }

    changeAnim();
    fillCopyOfSelect();
}

//div optHolder
function fillFrameHolder(){

    let holder = document.getElementById("optHolder");
    holder.innerHTML = "";

    let frames, copy;
    if (wPMDSprite.anims[dAnim].copyOf){
        frames = wPMDSprite.anims[wPMDSprite.anims[dAnim].copyOf].frames[0];
        notcopy = false;
    } else {
        frames = wPMDSprite.anims[dAnim].frames[0];
        notcopy = true;
    }

    for (i in frames){
        
        let input = document.createElement("input");
        input.setAttribute("type","radio");
        input.setAttribute("name","frame");
        input.setAttribute("id","frame" + i);
        input.setAttribute("onchange","changeSelectedFrame(" + i + ");jumpToFrame(" + i + ");");
        input.setAttribute("value", i);
        holder.appendChild(input)
        let label = document.createElement("label");
        label.setAttribute("for", "frame" + i);
        label.innerHTML = "Frame " + i;
        holder.appendChild(label);

        if (notcopy){
            label = document.createElement("label");
            label.setAttribute("for", i);
            label.innerHTML = "\tDuration";
            holder.appendChild(label);
            input = document.createElement("input");
            input.setAttribute("type","number");
            input.setAttribute("name","duration");
            input.setAttribute("id","frameDuration" + i);
            input.setAttribute("min","0");
            input.setAttribute("max","200");
            input.setAttribute("onchange","changeFrameDuration(" + i + ", this);");
            input.setAttribute("value", frames[i]["duration"]);
            holder.appendChild(input)
        }

        holder.appendChild(document.createElement("br"));
    }
    holder.firstChild.setAttribute("checked","true");

    changeSelectedFrame(0);
}

function fillDirectionSelect(){
    let select = document.getElementById("selectDirect");
    select.innerHTML = "";

    
    select.getElementsByTagName("option")[0].checked
}

function fillCopyOfSelect(){

    document.getElementById('selCopyOf').innerHTML = "";

    for (i in wPMDSprite.anims){

        if(wPMDSprite.anims[i].copyOf) continue;

        let option = document.createElement("option");
        option.innerHTML = wPMDSprite.anims[i].name;
        option.setAttribute("value", wPMDSprite.anims[i].name);
        document.getElementById('selCopyOf').appendChild(option);
    }
}

function tweekSprite(element, direction){
    let coord;
    stopDraw();
    
    switch (element){
        case "sp":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["spriteoffset"];
            break;
        case "sw":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["shadow"];
            break;
        case "or":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["offsetsr"];
            break;
        case "og":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["offsetsg"];
            break;
        case "ob":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["offsetsb"];
            break;
        case "ok":
            coord = wPMDSprite['anims'][dAnim]['frames'][dDirection][dFrame]["offsetsk"];
            break;
    }
    switch (direction){
        case "lu":
            coord[0]--;
            coord[1]--;
            break;
        case "u":
            coord[1]--;
            break;
        case "ur":
            coord[0]++;
            coord[1]--;
            break;
        case "l":
            coord[0]--;
            break;
        case "r":
            coord[0]++;
            break;
        case "ld":
            coord[0]--;
            coord[1]++;
            break;
        case "d":
            coord[1]++;
            break;
        case "dr":
            coord[0]++;
            coord[1]++;
            break;
    }
    redrawFrame();
}

function getSelectedFrame(){
    for (i in document.getElementById("optHolder").getElementsByTagName("input")){
        if (document.getElementById("optHolder").getElementsByTagName("input")[i].checked){
            return i;
        }
    }
}

function addAnimation(){

    document.getElementById('selNewName').innerHTML = "";

    for (i in POSIBLENAMES){
        if (POSIBLENAMES[i] in wPMDSprite.anims) continue;

        let option = document.createElement("option");
        option.innerHTML = POSIBLENAMES[i];
        option.setAttribute("value", POSIBLENAMES[i]);
        document.getElementById('selNewName').appendChild(option);
    }
    changeNewName();
    document.getElementById("divNewAnimation").hidden = false;
}

//when the animation selector changes
function changeAnim(){

    dAnim = document.getElementById('selectAnim').value;

    document.getElementById('animName').innerHTML = wPMDSprite.anims[dAnim].name;
    document.getElementById('numbIndex').value = wPMDSprite.anims[dAnim].index;

    let bool = (wPMDSprite.anims[dAnim].copyOf) ? true : false

    document.getElementById('chkCopyOf').checked = bool;
    document.getElementById('selCopyOf').value = wPMDSprite.anims[dAnim].copyOf;
    document.getElementById('numbWidth').value = wPMDSprite.anims[dAnim].frameWidth;
    document.getElementById('numbHeight').value = wPMDSprite.anims[dAnim].frameHeight;
    document.getElementById('chkRushFrame').checked = (wPMDSprite.anims[dAnim].rushFrame != null);
    document.getElementById('numbRushFrame').value = wPMDSprite.anims[dAnim].rushFrame;
    document.getElementById('chkHitFrame').checked = (wPMDSprite.anims[dAnim].hitFrame != null);
    document.getElementById('numbHitFrame').value = wPMDSprite.anims[dAnim].hitFrame;
    document.getElementById('chkReturnFrame').checked = (wPMDSprite.anims[dAnim].returnFrame != null);
    document.getElementById('numbReturnFrame').value = wPMDSprite.anims[dAnim].returnFrame;

    document.getElementById('selCopyOf').disabled = !bool;
    document.getElementById('butCopyOf').disabled = !bool;
    document.getElementById('numbWidth').disabled = bool;
    document.getElementById('numbHeight').disabled = bool;
    document.getElementById('butHeight').disabled = bool;
    document.getElementById('chkRushFrame').disabled = bool;
    document.getElementById('numbRushFrame').disabled = bool;
    document.getElementById('numbRushFrame').max = wPMDSprite.anims[dAnim].frames[0].length - 1;
    document.getElementById('chkHitFrame').disabled = bool;
    document.getElementById('numbHitFrame').disabled = bool;
    document.getElementById('numbHitFrame').max = wPMDSprite.anims[dAnim].frames[0].length - 1;
    document.getElementById('chkReturnFrame').disabled = bool;
    document.getElementById('numbReturnFrame').disabled = bool;
    document.getElementById('numbReturnFrame').max = wPMDSprite.anims[dAnim].frames[0].length - 1;

    if (dAnim == "Walk" || dAnim == "Idle"){
        document.getElementById('butDelAnim').disabled = true;
    } else{
        document.getElementById('butDelAnim').disabled = false;
    }

    document.getElementById('divFramesTweek').hidden = bool;
    document.getElementById('butAddFrame').disabled = bool;
    document.getElementById('butRemoveFrame').disabled = bool;

    
    if (wPMDSprite["anims"][dAnim]["frames"].length == 1) {
        dOneDir = true;
        changeDirection(0);
    } else {
        dOneDir = false;
    }

    fillFrameHolder();
    changeDirection();
    changeSpecialFrame();
    restartDraw();
}

//when the frame is changed
function changeSelectedFrame(frame){

    dFrame = frame;
    document.getElementById("frame" + frame).checked = true;
}

function changeChkDraw(){
    dShadow = document.getElementById('chkshadow').checked;
    dOffsets = document.getElementById('chkoffsets').checked;
    dBackground = document.getElementById('chkbackground').checked;
}

function changeChkHighlight(){
    offhighlightn = 0;
    offhighlight = document.getElementById('chkhighlight').checked;
}

function changeDirection(dir = dDirection){

    changeSelectedFrame(0);

    dDirection = dir;

    updateArrows();

    if (dStop) jumpToFrame(dFrame);
}

function changeScale(){

    dScale = document.getElementById('selectScale').value;
    dctx.canvas = document.getElementById('frame');

    dctx.canvas.height = 150 * dScale;
    dctx.canvas.width = 150 * dScale;

    if (dStop) jumpToFrame(dFrame);
}

function changeSpeed(){
    dSpeed = parseInt(document.getElementById('selectSpeed').value);

    restartDraw()
}

function changeNewName(){

    let val = document.getElementById('selNewName').value;
    document.getElementById('numbNewIndex').value = POSIBLENAMES.indexOf(val);
}

function changeFrameDuration(frame, element){

    wPMDSprite.anims[dAnim].frames[0][frame].duration = parseInt(element.value);
}

function changeSpecialFrame(spec=null){

    if (document.getElementById('chkRushFrame').checked){
        document.getElementById('numbRushFrame').disabled = false;
        if (!wPMDSprite.anims[dAnim].rushFrame) wPMDSprite.anims[dAnim].rushFrame = 0;
        document.getElementById('numbRushFrame').value = wPMDSprite.anims[dAnim].rushFrame;
    } else {
        document.getElementById('numbRushFrame').disabled = true;
        wPMDSprite.anims[dAnim].rushFrame = null;
    }
    if (document.getElementById('chkHitFrame').checked){
        document.getElementById('numbHitFrame').disabled = false;
        if (!wPMDSprite.anims[dAnim].hitFrame) wPMDSprite.anims[dAnim].hitFrame = 0
        document.getElementById('numbHitFrame').value = wPMDSprite.anims[dAnim].hitFrame;
    } else {
        document.getElementById('numbHitFrame').disabled = true;
        wPMDSprite.anims[dAnim].hitFrame = null;
    }
    if (document.getElementById('chkReturnFrame').checked){
        document.getElementById('numbReturnFrame').disabled = false;
        if (!wPMDSprite.anims[dAnim].returnFrame) wPMDSprite.anims[dAnim].returnFrame = 0;
        document.getElementById('numbReturnFrame').value = wPMDSprite.anims[dAnim].returnFrame;
    } else {
        document.getElementById('numbReturnFrame').disabled = true;
        wPMDSprite.anims[dAnim].returnFrame = null;
    }
    switch (spec){
        case "rush": 
            wPMDSprite.anims[dAnim].rushFrame = parseInt(document.getElementById('numbRushFrame').value);
            break;
        case "hit": 
            wPMDSprite.anims[dAnim].hitFrame = parseInt(document.getElementById('chkHitFrame').value);
            break;
        case "return": 
            wPMDSprite.anims[dAnim].returnFrame = parseInt(document.getElementById('chkReturnFrame').value);
            break;
    }
}

function changeChkCopyOf(){
    let bool = document.getElementById('chkCopyOf').checked;

    document.getElementById('selCopyOf').disabled = !bool;
    document.getElementById('butCopyOf').disabled = !bool;
}

function updateArrows(){

    let arrows = Array.from(document.getElementsByClassName('dirArr'));

    if (dOneDir) {
        
        for (let elem in arrows){
            arrows[elem].classList.remove("active");
            arrows[elem].classList.add("disabled");
        }
        document.getElementById('dirArrCent').classList.remove("disabled");
        document.getElementById('dirArrCent').classList.add("active");
    } else {

        for (let elem in arrows){
            arrows[elem].classList.remove("disabled","active");
        }
        document.getElementById('dirArrCent').classList.add("disabled");
        document.getElementById('dirArrCent').classList.remove("active");

        document.getElementById(DIRSRTNAMES[dDirection]).classList.add("active");
    }
}

function updateWarningsDiv(entry = false){
    let container = document.getElementById("containerWarnings");
    container.innerHTML = "";

    if (!entry){
        for (i in activeErrors){

            let p = document.createElement("p");
            p.setAttribute("class","Warning" + activeErrors[i].severity);
            p.innerHTML = "[" + activeErrors[i].category + "] " + activeErrors[i].msg;
            container.appendChild(p);
        }
    } else {
        let p = document.createElement("p");
        p.setAttribute("class","Warning" + entry.severity);
        p.innerHTML = "[" + entry.category + "] " + entry.msg;
        container.appendChild(p);
    }
}

function changeIndex(){

    let tidx = document.getElementById("numbIndex").value;
    let repeated = false;
    for (i in wPMDSprite.anims){
        if (wPMDSprite.anims[i].index == tidx && i != dAnim){
            repeated = true;
        }
    }
    document.getElementById("butIndex").disabled = repeated;
}

function progressBarIncrease (message = "Loading"){

    currProgress++;
    progressBarModify(message);
}

function progressBarSet (progress = 0){

    currProgress = progress;
    progressBarModify();
}

function progressBarSetMax (max, reset = false, message = false){
    maxProgress = max;
    if (reset){
        currProgress = 0;
    }

    progressBarModify(message);
}

function progressBarModify (message = false){
    let bar = document.getElementById("progressBarFill");
    let text = document.getElementById("progressBarText");

    width = (currProgress/maxProgress) * 100;

    bar.style.width = width + "%";
    if (message) text.innerHTML = message;
}

function progressBarHide(bool){
    document.getElementById("progressBar").hidden = bool;
}