function drawFrame(){

    let anim;
        if (wPMDSprite.anims[dAnim].copyOf){
            anim = wPMDSprite.anims[wPMDSprite.anims[dAnim].copyOf];
        } else {
            anim = wPMDSprite.anims[dAnim];
    }

    if (dWait == 0 && dAnim){
        dctx.clearRect(0, 0, 200 * dScale, 200 * dScale);
        dctx.imageSmoothingEnabled = false;
        
        let w = anim.frames[dDirection][dFrame].sprite.width * dScale;
        let h = anim.frames[dDirection][dFrame].sprite.height * dScale;
        let x = (75 - anim.frameWidth / 2) * dScale;
        let y = (75 - anim.frameHeight / 2) * dScale;
        let ox = anim.frames[dDirection][dFrame].spriteoffset[0] * dScale
        let oy = anim.frames[dDirection][dFrame].spriteoffset[1] * dScale

        let sx = (anim.frames[dDirection][dFrame].shadow[0] - 16) * dScale;
        let sy = (anim.frames[dDirection][dFrame].shadow[1] - 8) * dScale;

        if (dBackground) dctx.drawImage(imgBackground, backoffx * dScale, backoffy * dScale, 240 * dScale, 240 * dScale);

        if (dShadow) dctx.drawImage(imgShadows, 0, wPMDSprite.shadowSize * 32, 32, 16, x + sx, y + sy, 32 * dScale, 16 * dScale);

        if (anim.frames[dDirection][dFrame].sprite)
            dctx.drawImage(anim.frames[dDirection][dFrame].sprite, x + ox, y + oy, w, h);

        if (dOffsets){
            if (offhighlight){

                dctx.fillStyle = offhighlightarray[offhighlightn];

                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsr[0] * dScale -1 * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsr[1] * dScale, 3 * dScale, dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsr[0] * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsr[1] * dScale -1 * dScale, dScale, 3 * dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsg[0] * dScale -1 * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsg[1] * dScale, 3 * dScale, dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsg[0] * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsg[1] * dScale -1 * dScale, dScale, 3 * dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsb[0] * dScale -1 * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsb[1] * dScale, 3 * dScale, dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsb[0] * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsb[1] * dScale -1 * dScale, dScale, 3 * dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsk[0] * dScale -1 * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsk[1] * dScale, 3 * dScale, dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsk[0] * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsk[1] * dScale -1 * dScale, dScale, 3 * dScale);
                
                offhighlightn++;
                if (offhighlightn == 5) offhighlightn = 0;

            } else {

                dctx.fillStyle = "rgb(255,0,0)";
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsr[0] * dScale -1 * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsr[1] * dScale, 3 * dScale, dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsr[0] * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsr[1] * dScale -1 * dScale, dScale, 3 * dScale);
                
                dctx.fillStyle = "rgb(0,255,0)";
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsg[0] * dScale -1 * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsg[1] * dScale, 3 * dScale, dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsg[0] * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsg[1] * dScale -1 * dScale, dScale, 3 * dScale);
                
                dctx.fillStyle = "rgb(0,0,255)";
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsb[0] * dScale -1 * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsb[1] * dScale, 3 * dScale, dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsb[0] * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsb[1] * dScale -1 * dScale, dScale, 3 * dScale);
                
                dctx.fillStyle = "rgb(0,0,0)";
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsk[0] * dScale -1 * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsk[1] * dScale, 3 * dScale, dScale);
                dctx.fillRect(x + ox + anim.frames[dDirection][dFrame].offsetsk[0] * dScale, y + oy + anim.frames[dDirection][dFrame].offsetsk[1] * dScale -1 * dScale, dScale, 3 * dScale);
            }
        }
    }

    dWait++;
    if(dWait >= anim.frames[dDirection][dFrame].duration * dSpeed){
        dFrame++;
        dWait = 0;
    }
    if(dFrame >=  anim.frames[dDirection].length) dFrame = 0;

    if(!dStop) requestAnimationFrame(drawFrame);
}

function startDraw(){

    dFrame = 0;
    dWait = 0;
    dStop = false;

    drawFrame();
}

function stopDraw(){

    dStop = true;
}

function restartDraw(){

    stopDraw();
    setTimeout(startDraw, 100);
}

function stepDraw(){

    stopDraw();
    
    dWait = 0;
    dFrame++;
    if(dFrame >= wPMDSprite["anims"][dAnim]["frames"][dDirection].length) dFrame = 0;

    changeSelectedFrame(dFrame);

    setTimeout(drawFrame(), 100);
}

function redrawFrame(){

    jumpToFrame(dFrame);
}

function jumpToFrame(frame){
    stopDraw();

    dFrame = frame;
    dWait = 0;

    drawFrame();
}