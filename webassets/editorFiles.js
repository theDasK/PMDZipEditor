// Main function, that reads a zip and returns a PMDZip object
async function createPMDSpriteFromZip (zip){
    let progressSteps = ((Object.keys(zip.files).length - 1) / 3) + 1;
    progressBarSetMax(progressSteps, true);
    progressBarHide(false);

    let xmldata = await zip.file("AnimData.xml").async("text");
    let animData = parseAnimData(xmldata);

    if (!animData) {
        addWarning("Error", "xml", "Malformed or invalid XML. Aborting load.");
        return;
    }

    let PMDSprite = createPMDSpriteObj('MissingNo', 'Anonymous', animData[0]);

    if (animData[1].length == 0) addWarning("Error", "animation", "The file has no animations");

    for(let i = 0; i < animData[1].length; i++) {

        PMDSprite['anims'][animData[1][i][0]] = createAnimationObj (animData[1][i][0], animData[1][i][1], animData[1][i][2], animData[1][i][3], animData[1][i][4], animData[1][i][5], animData[1][i][6], animData[1][i][7]);

        if (!PMDSprite['anims'][animData[1][i][0]]["copyOf"]){

            let frames = await parseFramesFromZip(animData[1][i][0], animData[1][i][3], animData[1][i][4], zip, animData[1][i][8].length);
            let shadows = await parseShadowsFromZip(animData[1][i][0], animData[1][i][3], animData[1][i][4], zip, frames[0].length);
            let offsets = await parseOffsetsFromZip(animData[1][i][0], animData[1][i][3], animData[1][i][4], zip, frames[0].length);
            if (frames.length == 1) PMDSprite['anims'][animData[1][i][0]]['frames'] = [[]];

            for (let j = 0; j < animData[1][i][8].length; j++){

                if (frames.length == 1){

                    PMDSprite['anims'][animData[1][i][0]]['frames'][0].push(createFrameObj(animData[1][i][8][j], frames[0][j][0], shadows[0][j], offsets[0][j][0], offsets[0][j][1], offsets[0][j][2], offsets[0][j][3], frames[0][j][1]));
                } else {

                    for (let k = 0; k < 8; k++){
                        PMDSprite['anims'][animData[1][i][0]]['frames'][k].push(createFrameObj(animData[1][i][8][j], frames[k][j][0], shadows[k][j], offsets[k][j][0], offsets[k][j][1], offsets[k][j][2], offsets[k][j][3], frames[k][j][1]));
                    }
                }
            }
        }
        progressBarIncrease("Loading Sprite: " + animData[1][i][0] + "  -  " + (i+1) + "/" + progressSteps, true);
    }
    progressBarHide(true);
    return PMDSprite;
}

//This will parse and sanity check the xml TODO: Sanitycheck
function parseAnimData (xmldata){

    let data = [];

    try {
        let parser = new DOMParser();
        let xml = parser.parseFromString(xmldata,"text/xml");

        data[0] = parseInt(xml.getElementsByTagName("ShadowSize")[0].innerHTML);
        data[1] = [];

        let animTags = xml.getElementsByTagName("Anim");
        for (let i = 0; i < animTags.length; i++) {

            let anims = Array(9).fill(null);
            anims[8] = [];

            anims[0] = animTags[i].getElementsByTagName("Name")[0].innerHTML;
            if (animTags[i].getElementsByTagName('Index')[0]) anims[1] = parseInt(animTags[i].getElementsByTagName("Index")[0].innerHTML);
            if (animTags[i].getElementsByTagName("CopyOf")[0]){
                anims[2] = animTags[i].getElementsByTagName("CopyOf")[0].innerHTML;
                data[1].push(anims)
                continue;
            }

            anims[3] = parseInt(animTags[i].getElementsByTagName("FrameWidth")[0].innerHTML);
            anims[4] = parseInt(animTags[i].getElementsByTagName("FrameHeight")[0].innerHTML);
            if (animTags[i].getElementsByTagName('RushFrame')[0]) anims[5] = parseInt(animTags[i].getElementsByTagName("RushFrame")[0].innerHTML);
            if (animTags[i].getElementsByTagName('HitFrame')[0]) anims[6] = parseInt(animTags[i].getElementsByTagName("HitFrame")[0].innerHTML);
            if (animTags[i].getElementsByTagName('ReturnFrame')[0]) anims[7] = parseInt(animTags[i].getElementsByTagName("ReturnFrame")[0].innerHTML);
            
            let durations = animTags[i].getElementsByTagName("Durations")[0].children;
            for (let j = 0; j < durations.length; j++){

                anims[8].push(parseInt(durations[j].innerHTML));
            }

            data[1].push(anims);
        }
    } catch {

        return false;
    }

    return data;
}

//checks if file exists on zip and pipes the file to parseFramesfromIMG
async function parseFramesFromZip(name, fwidth, fheight, zip, nframes){

    if (name + "-Anim.png" in zip.files){   //check if the file exists
        let b64 = await zip.file(name + "-Anim.png").async("base64")
        let img = await getImgfromB64(b64);

        //sanity check file size
        if (img.width != nframes * fwidth || !(img.height == fheight || img.height == fheight * 8)){
            addWarning("Warning", "sprite", "The file " + name + "-Anim.png has different dimensions than expected, check the frame sizes or the image dimesions. Sprites in that animation may look wrong or some might be missing.");
        }

        return await parseFramesfromIMG(fwidth, fheight, img, nframes);
    }else {

        addWarning("Error", "sprite", "The file " + name + "-Anim.png is missing or broken (name is Case Sensitive). Generating an empty/transparent spritesheet.");
        frames = generateEmptyFrames(fwidth, fheight, nframes, 8);
        return null;
    }
}

//returns array of canvases from a file inside the zip
async function parseFramesfromIMG(fwidth, fheight, img){
    let directions = [];

    for (let j = 0; j < img.height; j += fheight){
        let frames = [];

        for (let i = 0; i < img.width; i += fwidth){

            let tempframe = document.createElement("canvas").getContext("2d");
            tempframe.canvas.width = fwidth;
            tempframe.canvas.height = fheight;

            tempframe.drawImage(img, i , j, fwidth, fheight, 0, 0, fwidth, fheight);
            borders = findBorders(tempframe.canvas);
            let offsets = [0,0];

            if (borders){

                offsets = [borders[0], borders[2]];
                let sw = borders[1] - borders[0];
                let sh = borders[3] - borders[2];
    
                tempframe.clearRect(0,0,fwidth,fheight);
                tempframe.canvas.width = sw;
                tempframe.canvas.height = sh;
    
                tempframe.drawImage(img, i + borders[0], j + borders[2], sw, sh, 0 , 0, sw, sh);
            }

            frames.push([tempframe.canvas,offsets]);
        }
        directions.push(frames);
    }
    return directions;
}

//returns an array of shadows coords from a file
async function parseShadowsFromZip(name, fwidth, fheight, zip, nframes){

    if (name + "-Shadow.png" in zip.files){         //check if the file exists


        let b64 = await zip.file(name + "-Shadow.png").async("base64");
        let img = await getImgfromB64(b64);
        //sanity check file size
        if (img.width != nframes * fwidth || !(img.height == fheight || img.height == fheight * 8)){
            addWarning("Warning", "shadow", "The file " + name + "-Shadow.png has different dimensions than expected, check the frame sizes or the image dimesions.");
        }

        let tempctx = document.createElement("canvas").getContext("2d");
        tempctx.canvas.width = img.width;
        tempctx.canvas.height = img.height;
        tempctx.drawImage(img, 0, 0);
        let directions = [];

        for (let j = 0; j < img.height; j += fheight){
            let frames = [];

            for (let i = 0; i < img.width; i += fwidth){
                data = tempctx.getImageData(i , j, fwidth, fheight);
                coord = [];

                for (let k = 0; k < data.data.length; k += 4){

                    if (data.data[k] == 255 && data.data[k+1] == 255 && data.data[k+2] == 255 && data.data[k+3] == 255){
            
                        if (coord.length == 0){    //check if theres not a shadow already
            
                            coord = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {

                            addWarning("Warning", "shadow", "Multiple shadows in " + name + "-Shadow.png, Direction: " + DIRNAMES[j/fheight] + " col/frame: " + (i/fwidth+1) + ". Using First.");
                        }
                    }
                }
                if (coord.length == 0){             //check if theres at least a shadow

                    coord = [[Math.trunc(fwidth/2), Math.trunc(fheight/2)], 1];
                    addWarning("Warning", "shadow", "Frame " + (i/fwidth+1) +", direction: " + DIRNAMES[j/fheight] + " in " + name + "-Shadow.png was missing a shadow. Auto generated one.");
                }
                frames.push(coord);
            }
            directions.push(frames);
        }
        return directions;
    } else {

        addWarning("Warning", "shadow", "The file " + name + "-Shadow.png is missing or broken (name is Case Sensitive). Generating default shadows for all frames");
        return generateEmptyShadows(fwidth,fheight,nframes,8);
    }
}

//returns an array of array with offset from a file
async function parseOffsetsFromZip(name, fwidth, fheight, zip, nframes){

    if (name + "-Offsets.png" in zip.files){         //check if the file exists

        let b64 = await zip.file(name + "-Offsets.png").async("base64")
        let img = await getImgfromB64(b64);
        //sanity check file size
        if (img.width != nframes * fwidth || !(img.height == fheight || img.height == fheight * 8)){
            addWarning("Warning", "offsets", "The file " + name + "-Offsets.png has different dimensions than expected, check the frame sizes or the image dimesions.");
        }

        let tempctx = document.createElement("canvas").getContext("2d");
        tempctx.canvas.width = img.width;
        tempctx.canvas.height = img.height;
        tempctx.drawImage(img, 0, 0);
        let directions = [];
        const OFFNAMES = ["red", "green" , "blue"]

        for (let j = 0; j < img.height; j += fheight){
            let frames = [];

            for (let i = 0; i < img.width; i += fwidth){
                data = tempctx.getImageData(i , j, fwidth, fheight);
                let coords = [null,null,null,null];

                for (let k = 0; k < data.data.length; k += 4){
                    //Black pixel
                    if (data.data[k] == 0 && data.data[k+1] == 0 && data.data[k+2] == 0 && data.data[k+3] == 255){
                        if (!coords[3]){
            
                            coords[3] = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {
                            addWarning("Warning", "offsets", "Multiple black offsets found on " + name + "-Offsets.png, Direction: " + DIRNAMES[j/fheight] + " col/frame: " + (i/fwidth+1) + ". Using First.");
                        }
                        continue;
                    }
                    // Red
                    if (data.data[k] == 255){
                        if (!coords[0]){             //check if theres not a offsets already
            
                            coords[0] = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {
                            addWarning("Warning", "offsets", "Multiple red offsets found on " + name + "-Offsets.png, Direction: " + DIRNAMES[j/fheight] + " col/frame: " + (i/fwidth+1) + ". Using First.");
                        }
                    }
                    // Green
                    if (data.data[k+1] == 255){
                        if (!coords[1]){
            
                            coords[1] = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {
                            addWarning("Warning", "offsets", "Multiple green offsets found on " + name + "-Offsets.png, Direction: " + DIRNAMES[j/fheight] + " col/frame: " + (i/fwidth+1) + ". Using First.");
                        }
                    }
                    // Blue
                    if (data.data[k+2] == 255){
                        if (!coords[2]){
            
                            coords[2] = [(k/4) % fwidth, Math.trunc((k/4)/fwidth)];
                        } else {
                            addWarning("Warning", "offsets", "Multiple blue offsets found on " + name + "-Offsets.png, Direction: " + DIRNAMES[j/fheight] + " col/frame: " + (i/fwidth+1) + ". Using First.");
                        }
                    }
                }
                //Now some sanity checks
                for (let k in [0,1,2]){
                    if (!coords[k]){             //if theres at least a single offset of each type            

                        coords[k] = [Math.trunc(fwidth/2), Math.trunc(fheight/2)];
                        addWarning("Warning", "offsets", "Missing "+OFFNAMES[k]+" offset on " + name + "-Offsets.png, Direction: " + DIRNAMES[j/fheight] + " col/frame: " + (i/fwidth+1) + ". Generating one.");
                    }
                }
                if (!coords[3]){                 //Lets not put the head pointer with other, as this one cant overlap;

                    coords[3] = [Math.trunc(fwidth/2), Math.trunc(fheight/2)-1];
                    addWarning("Warning", "offsets", "Missing black offset on " + name + "-Offsets.png, Direction: " + DIRNAMES[j/fheight] + " col/frame: " + ((i/fwidth+1)) + ". Generating one.");
                }
                frames.push(coords);
            }
            directions.push(frames);
        }
        return directions;
    }else {
        addWarning("Error", "offsets", "The file " + name + "-Offsets.png is missing or broken (name is Case Sensitive). Generating default shadows for all frames");
        return generateEmptyOffsets(fwidth,fheight,nframes,8);
    }
}

//returns an array that contains the row/col of: Highest, Lower, rightmost, leftmoss pixel, or null if sprite is missing
function findBorders(img){
    let tempx = [], tempy = [];

    let tempctx = document.createElement("canvas").getContext("2d");
    tempctx.canvas.width = img.width;
    tempctx.canvas.height = img.height;
    tempctx.drawImage(img, 0, 0);

    data = tempctx.getImageData(0 , 0, img.width, img.height);

    for (let k = 0; k < data.data.length; k += 4){

        if (data.data[k+3] == 255){

            tempx.push((k/4) % img.width);
            tempy.push(Math.trunc((k/4)/img.width));
        }
    }

    if (tempx == []){
        return null;
    }

    return [Math.min(...tempx), Math.max(...tempx) + 1, tempy[0], tempy[tempy.length-1] + 1];
}

//generate an array of empty imgs, so other functions dont crap out later
function generateEmptyFrames (fwidth, fheight, n, d){

    let direction = [];
    for (let j = 0; j < d; j++){
        let empty = [];
        for (let i = 0; i < n; i++){
            let tempctx = document.createElement("canvas").getContext("2d");
            tempctx.canvas.width = fwidth;
            tempctx.canvas.height = fheight;

            empty.push([tempctx.canvas,[0,0]]);
        }
        direction.push(empty);
    }
    return direction;
}

//Returns an array of middle of the frame coords
function generateEmptyShadows (fwidth, fheight, n, d){

    let direction = [];
    for (let j = 0; j < d; j++){
        let empty = [];
        for (let i = 0; i < n; i++){

            empty.push([Math.trunc(fwidth/2), Math.trunc(fheight/2)]);
        }
        direction.push(empty);
    }
    return direction;
}

//Returns an array of middle of the frame coords
function generateEmptyOffsets (fwidth, fheight, n, d){

    let direction = [];
    for (let j = 0; j < d; j++){
        let empty = [];
        for (let i = 0; i < n; i++){
            //TODO: make this thing less bad
            let precalr = [Math.trunc(fwidth/2), Math.trunc(fheight/2)];
            let precalg = [Math.trunc(fwidth/2), Math.trunc(fheight/2)];
            let precalb = [Math.trunc(fwidth/2), Math.trunc(fheight/2)];
            let precalk = [Math.trunc(fwidth/2), Math.trunc(fheight/2)+1];

            empty.push([precalr,precalg,precalb,precalk]);
        }
        direction.push(empty);
    }
    return direction;
}

//Import new sprites from the gui
function importSpriteSheet(element){

    if (element.files[0].type == "image/png"){
        
        loadSpritesheet(element.files[0]);
    } else {
        addWarning("Error","load","Spritesheet is not in PNG format");
    }
    element.value = "";
}

async function loadSpritesheet(file){

    let content = await getImgfromFile(file);
    let proceed;
    let sizecheck = wPMDSprite.anims[dAnim].frameWidth * wPMDSprite.anims[dAnim].frames[0].length == content.width &&
    wPMDSprite.anims[dAnim].frameHeight * wPMDSprite.anims[dAnim].frames.length == content.height;

    if (sizecheck){
        proceed = confirm("Are you sure you want to load a new spritesheet?");
    } else{
        proceed = confirm("Are you sure you want to load a new spritesheet? The size of files doesnt match, there might be missing frames. Try adjusting animtions frame size before importing");
        addWarning("Warning","load","Spritesheet is not the right size");
    }

    if (!proceed) return;

    frames = await parseFramesfromIMG(wPMDSprite.anims[dAnim].frameWidth, wPMDSprite.anims[dAnim].frameHeight, content);
    for (let j = 0; j < wPMDSprite.anims[dAnim].frames.length; j++){
        if (frames[j] === undefined) continue;
        for (let i = 0; i < wPMDSprite.anims[dAnim].frames[0].length; i++){
            if (frames[j][i] === undefined) continue;
            wPMDSprite.anims[dAnim].frames[j][i].sprite = frames[j][i];
        }
    }
}

//#################### Downloads
function downloadSprites(){

    let temp = generateSpriteSheet()

    var downloadLink = document.createElement("a");
    downloadLink.href = temp.toDataURL("image/png");
    downloadLink.download = dAnim + "-Anim.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

//TODO: tweek colors
function downloadHelper(){
    let temp = document.createElement("canvas").getContext("2d");
    let colors =["#484848","#A9A9A9"];
    let borders = false, eol = false;
    let fw = wPMDSprite.anims[dAnim].frameWidth;
    let fh = wPMDSprite.anims[dAnim].frameHeight;
    let x = wPMDSprite.anims[dAnim].frames[0].length;
    let y = wPMDSprite.anims[dAnim].frames.length;

    temp.canvas.width = fw * x;
    temp.canvas.height = fh * y;

    for (let j = 0; j < y; j++){
        eol = borders;
        for (let i = 0; i < x; i++){

            temp.fillStyle = borders ? colors[0] : colors[1];
            temp.fillRect(fw*i, fh*j, fw, fh);
            temp.clearRect(fw*i+2, fh*j+2, fw-4, fh-4);
            temp.fillStyle = !borders ? colors[0] : colors[1];
            temp.fillRect(fw*i+Math.trunc(fw/2)-1, fh*j+Math.trunc(fh/2)-1, 2, 2);
            borders = !borders
        }
        borders = !eol;
    }

    var downloadLink = document.createElement("a");
    downloadLink.href = temp.canvas.toDataURL("image/png");
    downloadLink.download = dAnim + "-Helper.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function downloadShadow(){

    temp = generateShadowsSheet();

    var downloadLink = document.createElement("a");
    downloadLink.href = temp.toDataURL("image/png");
    downloadLink.download = dAnim + "-Shadow.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function downloadOffsets(){

    let temp = generateOffsetsSheet();

    let downloadLink = document.createElement("a");
    downloadLink.href = temp.toDataURL("image/png");
    downloadLink.download = dAnim + "-Offsets.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function downloadXML(){

    let xml = generateXML();

    var downloadLink = document.createElement("a");
    downloadLink.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(xml);
    downloadLink.download = "AnimData.xml";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

async function downloadZip(){
    let zip = new JSZip();

    zip.file("AnimData.xml",generateXML());

    for (i in wPMDSprite.anims){
        if (wPMDSprite.anims[i].copyOf) continue;

        let name = wPMDSprite.anims[i].name;

        let blob = await getCanvasBlob(generateSpriteSheet(i))
        zip.file(name+"-Anim.png", blob);
        blob = await getCanvasBlob(generateShadowsSheet(i))
        zip.file(name+"-Shadow.png", blob);
        blob = await getCanvasBlob(generateOffsetsSheet(i))
        zip.file(name+"-Offsets.png", blob);
    }

    zip.generateAsync({type: "base64"}).then(function(content) {
        var link = document.createElement('a');
        link.href = "data:application/zip;base64," + content;
        link.download = "PMDSprite.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function generateSpriteSheet(anim = dAnim){
    let temp = document.createElement("canvas").getContext("2d");
    let w = wPMDSprite.anims[anim].frameWidth;
    let h = wPMDSprite.anims[anim].frameHeight;
    let fn = wPMDSprite.anims[anim].frames[0].length;
    let fd = wPMDSprite.anims[anim].frames.length;
    temp.canvas.width =  w * fn;
    temp.canvas.height = h * fd;

    for(let j = 0; j < fd; j++){
        for(let i = 0; i < fn; i++){
            temp.drawImage(wPMDSprite.anims[anim].frames[j][i].sprite,
                wPMDSprite.anims[anim].frames[j][i].spriteoffset[0] + i * w,
                wPMDSprite.anims[anim].frames[j][i].spriteoffset[1] + j * h);
        }
    }
    return temp.canvas;
}

function generateShadowsSheet(anim = dAnim){
    let temp = document.createElement("canvas").getContext("2d");
    let w = wPMDSprite.anims[anim].frameWidth;
    let h = wPMDSprite.anims[anim].frameHeight;
    let fn = wPMDSprite.anims[anim].frames[0].length;
    let fd = wPMDSprite.anims[anim].frames.length;
    temp.canvas.width =  w * fn;
    temp.canvas.height = h * fd;

    for(let j = 0; j < fd; j++){
        for(let i = 0; i < fn; i++){
                temp.drawImage(imgShadows, 1, 161, 22, 8,
                    i * w + wPMDSprite.anims[anim].frames[j][i].shadow[0] - 12,
                    j * h + wPMDSprite.anims[anim].frames[j][i].shadow[1] - 5, 22, 8);
        }
    }
    return temp.canvas;
}

function generateOffsetsSheet(anim = dAnim){
    let temp = document.createElement("canvas").getContext("2d");
    let w = wPMDSprite.anims[anim].frameWidth;
    let h = wPMDSprite.anims[anim].frameHeight;
    let fn = wPMDSprite.anims[anim].frames[0].length;
    let fd = wPMDSprite.anims[anim].frames.length;
    temp.canvas.width =  w * fn;
    temp.canvas.height = h * fd;

    for(let j = 0; j < fd; j++){
        for(let i = 0; i < fn; i++){
            let offsetsr = wPMDSprite.anims[anim].frames[j][i].offsetsr;
            let offsetsg = wPMDSprite.anims[anim].frames[j][i].offsetsg;
            let offsetsb = wPMDSprite.anims[anim].frames[j][i].offsetsb;
            let ox = wPMDSprite.anims[anim].frames[j][i].spriteoffset[0];
            let oy = wPMDSprite.anims[anim].frames[j][i].spriteoffset[1];

            temp.fillStyle = "rgb(255,0,0)";
            temp.fillRect(i * w + ox + offsetsr[0], j * h + oy + offsetsr[1], 1, 1);
            temp.fillStyle = "rgb(0,255,0)";
            temp.fillRect(i * w + ox + offsetsg[0], j * h + oy + offsetsg[1], 1, 1);
            temp.fillStyle = "rgb(0,0,255)";
            temp.fillRect(i * w + ox + offsetsb[0], j * h + oy + offsetsb[1], 1, 1);

            if (offsetsr == offsetsg){
                temp.fillStyle = "rgb(255,255,0)";
                temp.fillRect(i * w + ox + offsetsr[0], j * h + oy + offsetsr[1], 1, 1);
            }
            if (offsetsr == offsetsb){
                temp.fillStyle = "rgb(255,0,255)";
                temp.fillRect(i * w + ox + offsetsr[0], j * h + oy + offsetsr[1], 1, 1);
            }
            if (offsetsg == offsetsb){
                temp.fillStyle = "rgb(0,255,255)";
                temp.fillRect(i * w + ox + offsetsg[0], j * h + oy + offsetsg[1], 1, 1);
            }
            if (offsetsr == offsetsg && offsetsg == offsetsb){
                temp.fillStyle = "rgb(255,255,255)";
                temp.fillRect(i * w + ox + offsetsr[0], j * h + oy + offsetsr[1], 1, 1);
            }

            temp.fillStyle = "rgb(0,0,0)";
            temp.fillRect(i * w + ox + wPMDSprite.anims[anim].frames[j][i].offsetsk[0],
                j * h + oy + wPMDSprite.anims[anim].frames[j][i].offsetsk[1], 1, 1);
        }
    }
    return temp.canvas;
}

function generateXML(){ //this freeking thing, not the most correct way to generate an xml, but hey, it works!
    let xml = '<?xml version="1.0" ?>\n<AnimData>\n\t<ShadowSize>' + wPMDSprite.shadowSize + '</ShadowSize>\n\t<Anims>';
    for (i in wPMDSprite.anims){
        xml += '\n\t\t<Anim>\n\t\t\t<Name>' + wPMDSprite.anims[i].name + '</Name>';
        if (wPMDSprite.anims[i].index != undefined) xml += '\n\t\t\t<Index>' + wPMDSprite.anims[i].index + '</Index>';
        if (wPMDSprite.anims[i].copyOf){
            xml += '\n\t\t\t<CopyOf>' + wPMDSprite.anims[i].copyOf + '</CopyOf>\n\t\t</Anim>';
            continue;
        }
        xml += '\n\t\t\t<FrameWidth>'+wPMDSprite.anims[i].frameWidth+'</FrameWidth>\n\t\t\t<FrameHeight>'+wPMDSprite.anims[i].frameHeight+'</FrameHeight>';
        if (wPMDSprite.anims[i].rushFrame != undefined) xml += '\n\t\t\t<RushFrame>'+wPMDSprite.anims[i].rushFrame+'</RushFrame>';
        if (wPMDSprite.anims[i].hitFrame != undefined) xml += '\n\t\t\t<HitFrame>'+wPMDSprite.anims[i].hitFrame+'</HitFrame>';
        if (wPMDSprite.anims[i].returnFrame != undefined) xml += '\n\t\t\t<ReturnFrame>'+wPMDSprite.anims[i].returnFrame+'</ReturnFrame>';
        xml += "\n\t\t\t<Durations>";
        for (let j = 0; j < wPMDSprite.anims[i].frames[0].length; j++){
            xml += '\n\t\t\t\t<Duration>'+wPMDSprite.anims[i].frames[0][j].duration+'</Duration>';
        }
        xml += "\n\t\t\t</Durations>\n\t\t</Anim>";
    }
    xml += "\n\t</Anims>\n</AnimData>";

    return xml;
}

//########################## Helpers
async function loadFromZip(file){
    wPMDSprite = await createPMDSpriteFromZip(await loadZip(file));

    fillSelect();
    fillFrameHolder();
}

async function loadZip(content){
    
    result = await JSZip.loadAsync(content);
    return result;
}

//This generates an img object from a file Base64 string
async function getImgfromB64(filebase64){

    return new Promise((resolve, reject) => {
        let img = new Image();

        img.onload = function(){
            resolve(img);
        };

        img.onerror = reject; 
        img.src = "data:image/png;base64," + filebase64;
    })
}

//This generates an img object from a file object
async function getImgfromFile(file){

    return new Promise((resolve, reject) => {
        let img = new Image();

        img.onload = function(){
            resolve(img);
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    })
}

async function getCanvasBlob(canvas){
    return new Promise(function(resolve, reject) {
        canvas.toBlob(function (blob) {
            resolve(blob);
        });
    });
}