function createEmptyZip(){

    let proceed = confirm("Are you sure you want to create a new file? this will destroy all unsaved changes");
    if (!proceed) return;

    let PMDSprite = createPMDSpriteObj('MissingNo', 'Anonymous', 1);
    PMDSprite.anims["Walk"] = createAnimationObj("Walk",0,false,20,20,null,null,null);
    PMDSprite.anims["Idle"] = createAnimationObj("Idle",7,false,20,20,null,null,null);

    let frames = generateEmptyFrames(20, 20, 1, 8);
    let shadows = generateEmptyShadows(20, 20, 1, 8);
    let offsets = generateEmptyOffsets(20, 20, 1, 8);

    for (let k = 0; k < 8; k++){
        PMDSprite.anims["Walk"].frames[k].push(createFrameObj(4, frames[k][0], shadows[k][0], offsets[k][0][0], offsets[k][0][1], offsets[k][0][2], offsets[k][0][3], [0,0]));
        PMDSprite.anims["Idle"].frames[k].push(createFrameObj(4, frames[k][0], shadows[k][0], offsets[k][0][0], offsets[k][0][1], offsets[k][0][2], offsets[k][0][3], [0,0]));
    }
    stopDraw();
    dAnim = "Walk";
    dFrame = 0;
    wPMDSprite = PMDSprite;
    fillSelect();
    setTimeout(startDraw, 100);
}

//creates an empty object that contains all data to build the PMDSpriteZIP
function createPMDSpriteObj (name = 'MissingNo', credits = 'Anonymous', shadowSize = 2){

    let PMDSprite = {};

    PMDSprite['name'] = name; //this 2 properties are not used, for now
    PMDSprite['credits'] = credits;

    PMDSprite['shadowSize'] = parseInt(shadowSize);
    PMDSprite['anims'] = {};

    return PMDSprite;
}

//creates an empty object that contains a single animation, pretty straightfordward
function createAnimationObj (name, index = null, copyof = false, width = 0, height = 0, rush = null, hit = null, ret = null){

    let animation = {}

    animation['name'] = name;
    animation['index'] = index;
    animation['copyOf'] = copyof;

    animation['frameWidth'] = width;
    animation['frameHeight'] = height;
    animation['rushFrame'] = rush;
    animation['hitFrame'] = hit;
    animation['returnFrame'] = ret;

    animation['frames'] = Array.from({ length: 8 }, () => []); //the array has either 1 element or 8 elements and correspond to the directions clockwise

    return animation;
}

//creates an empty object that contains all its parts
function createFrameObj (duration = 1, sprite = null, shadow = null, offsetr = null, offsetg = null, offsetb = null, offsetk = null, spriteoffset = [0,0]){

    let frame = {};

    frame['duration'] = duration;
    frame['sprite'] = sprite;

    frame['spritew'] = sprite.width;
    frame['spriteh'] = sprite.height;

    frame['shadow'] = shadow;
    frame['offsetsr'] = [offsetr[0] - spriteoffset[0], offsetr[1] - spriteoffset[1]];//left hand
    frame['offsetsg'] = [offsetg[0] - spriteoffset[0], offsetg[1] - spriteoffset[1]];//body
    frame['offsetsb'] = [offsetb[0] - spriteoffset[0], offsetb[1] - spriteoffset[1]];//right hand
    frame['offsetsk'] = [offsetk[0] - spriteoffset[0], offsetk[1] - spriteoffset[1]];//face/mouth

    frame['spriteoffset'] = spriteoffset;

    return frame;
}

function applyIndex(){
    wPMDSprite.anims[dAnim].index = parseInt(document.getElementById("numbIndex").value);
}

function applyCopyOf(){
    wPMDSprite.anims[dAnim].index = parseInt(document.getElementById("selCopyOf").value);
}

function applySizeChange(){
    let tempw = parseInt(document.getElementById("numbWidth").value);
    let temph = parseInt(document.getElementById("numbHeight").value);

    let offw = (tempw == wPMDSprite.anims[dAnim].frameWidth) ? 0 : (tempw - wPMDSprite.anims[dAnim].frameWidth) / 2;
    let offh = (temph == wPMDSprite.anims[dAnim].frameHeight) ? 0 : (temph - wPMDSprite.anims[dAnim].frameHeight) / 2;

    for (let j in wPMDSprite.anims[dAnim].frames){
        for (let i in wPMDSprite.anims[dAnim].frames[j]){
            let tempctx = document.createElement("canvas").getContext("2d");
            tempctx.canvas.width = tempw;
            tempctx.canvas.height = temph;
            tempctx.drawImage(wPMDSprite.anims[dAnim].frames[j][i].sprite, offw, offh);

            wPMDSprite.anims[dAnim].frames[j][i].sprite = tempctx.canvas;

            wPMDSprite.anims[dAnim].frames[j][i].shadow[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].shadow[1] += offh;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsr[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsr[1] += offh;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsg[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsg[1] += offh;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsb[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsb[1] += offh;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsk[0] += offw;
            wPMDSprite.anims[dAnim].frames[j][i].offsetsk[1] += offh;
        }
    }
    wPMDSprite.anims[dAnim].frameWidth = tempw;
    wPMDSprite.anims[dAnim].frameHeight = temph;
}

function createAnimation(){

    let newName = document.getElementById("selNewName").value;
    let newIdx = parseInt(document.getElementById("numbNewIndex").value);
    let neww = parseInt(document.getElementById("numbNewWidth").value);
    let newh = parseInt(document.getElementById("numbNewHeight").value);
    let newnf = parseInt(document.getElementById("numbNewFrames").value);
    let newdir = document.getElementById("chkNewDirection").checked ? 1 : 8;

    animObj = createAnimationObj(newName, newIdx, false, neww, newh);
    if (newdir == 1) animObj.frames = [];

    let frames = generateEmptyFrames(neww, newh, newnf, newdir);
    let shadows = generateEmptyShadows(neww, newh, newnf, newdir);
    let offsets = generateEmptyOffsets(neww, newh, newnf, newdir);

    for (let i = 0; i < newdir; i++){
        animObj.frames.push([])
        for (let j = 0; j < newnf; j++){
            animObj.frames[i].push(createFrameObj(4, frames[i][j],shadows[i][j], offsets[i][j][0], offsets[i][j][1], offsets[i][j][2], offsets[i][j][3], [0,0]));
        }
    }

    wPMDSprite.anims[newName] = animObj;

    document.getElementById("divNewAnimation").hidden = true;
    fillSelect();
}

function removeAnimation(){

    if (dAnim == "Walk" || dAnim == "Idle") return;

    let proceed = confirm("Are you sure you want to delete animation " + dAnim);

    tdDelete = dAnim;
    dAnim = "Walk"

    if (proceed){
        delete wPMDSprite.anims[tdDelete];
    }

    fillSelect();
}

function createFrame(){

    let newdir = wPMDSprite.anims[dAnim].frames == 1 ? 1 : 8;
    let neww = wPMDSprite.anims[dAnim].frameWidth;
    let newh = wPMDSprite.anims[dAnim].frameHeight;

    let frames = generateEmptyFrames(neww, newh, 1, newdir);
    let shadows = generateEmptyShadows(neww, newh, 1, newdir);
    let offsets = generateEmptyOffsets(neww, newh, 1, newdir);

    for (let i = 0; i < newdir; i++){
        wPMDSprite.anims[dAnim].frames[i].push(createFrameObj(4, frames[i][0],shadows[i][0], offsets[i][0][0], offsets[i][0][1], offsets[i][0][2], offsets[i][0][3], [0,0]));
    }
    fillFrameHolder();
}

function removeFrame(){
    
    if (wPMDSprite.anims[dAnim].frames[0].length <= 1) return;

    let proceed = confirm("Are you sure you want to delete the selected frame?");
    let newdir = wPMDSprite.anims[dAnim].frames == 1 ? 1 : 8;

    if (proceed){
        stopDraw();

        for (let i = 0; i < newdir; i++){
            wPMDSprite.anims[dAnim].frames[i].splice(dFrame, 1);
        }

        setTimeout(startDraw, 100);
        fillFrameHolder();
    }
}
