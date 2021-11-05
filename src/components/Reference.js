import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    makeStyles } from '@material-ui/core';
import {LIMIT_SIZE} from '../utils/globalConstant';

const Reference = ({genomeViewer:{prevMin, min, max, pivot, interval, reference, prevRefence, currentAction}}) => {
    const classes = useStyles();
    const ctxRef = useRef(null);

    useEffect(() => {
        if(prevRefence.length > 0){
            let ctx = ctxRef.current;
            const referenceCanvas = document.getElementById('reference');
            if(referenceCanvas){
                ctx = referenceCanvas.getContext("2d");
                const canvasWidth = referenceCanvas.width;
                const canvasHeight = referenceCanvas.height;
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                let newInterval;
                if ((max+1) - min >= LIMIT_SIZE){
                    newInterval = Math.floor((max - min + LIMIT_SIZE) /  LIMIT_SIZE);
                }else{
                    newInterval = 1;
                }
    
                //Draw Reference
                if(currentAction === "zoomIn" || currentAction === "zoomOut"){
                    drawReferenceFromPivot(ctx, {canvasWidth, canvasHeight}, {min, max}, prevRefence, newInterval, interval, pivot, prevMin);
                }else if(currentAction === "moveLeft"){
                    drawReferenceFromRight(ctx, {canvasWidth, canvasHeight}, {min, max}, interval, prevRefence, pivot);
                }else {
                    drawReferenceFromLeft(ctx, {canvasWidth, canvasHeight}, {min, max}, interval, prevRefence, pivot);
                }
            }
        }
    }, [min, max, currentAction, interval, pivot, prevMin, prevRefence]);

    useEffect(() => {
        if(reference.length > 0){
            let ctx = ctxRef.current;
            const referenceCanvas = document.getElementById('reference');
            const canvasWidth = referenceCanvas.width;
            const canvasHeight = referenceCanvas.height;
            if(referenceCanvas){
                ctx = referenceCanvas.getContext("2d");
                ctx.clearRect(0, 0, referenceCanvas.width, referenceCanvas.height);
                drawReference(ctx, {canvasWidth, canvasHeight}, {min, max}, interval, reference, pivot);
            }
        }
    }, [reference]);

    return(
        <div className={classes.referenceContainer}>
            <div className={classes.reference}>
                <canvas id="reference" width="2000" height="100" style={{
                    width: '100%',
                    height: '100%',
                }}></canvas>
            </div>
        </div>
    );
};

Reference.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer,
});

export default React.memo(connect(mapStateToProps, {})(Reference));

//Style
const useStyles = makeStyles((theme) => ({
    referenceContainer: {
        height: "5em",
    },
    reference: {
        height: "100%",
        display: 'flex',
        flexDirection: "column",
        justifyContent: "center",
        padding: '0 16px',
    },
    label: {
        display: "flex",
    },
}));


// Functions
const selectColor = (letter) => {
    let color;
    switch(letter) {
        case "A":
        case "a":
            color = "#2e6683";
            break;
        case "T":
        case "t":
            color = "#f3df6d";
            break;
        case "C":
        case "c":
            color = "#c64354";
            break;
        case "G":
        case "g":
            color = "#69d29b";
            break;
        case "N":
        case "n":
            color = "#A0A0A0";
            break;
        default:
            color = "#ffffff"
    }
    return color;
}

const drawLine = (ctx, info, style, lineCap = {}) => {
    const { x, y, x1, y1 } = info;
    const { color = 'black', width = 1 } = style;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.lineCap = lineCap;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

const drawLetter = (ctx, canvasHeight, letter, info = {}, width) => {
    const { x, y } = info;

    //Draw background
    let color = selectColor(letter);
    drawLine(ctx, {x: x, y: canvasHeight*.75, x1: x, y1: canvasHeight}, {width: width, color: color}, "butt")

    ctx.beginPath();
    ctx.font='bold 25px Roboto';
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";

    ctx.fillText(letter, x, canvasHeight - 2);
    ctx.closePath();
}

const drawReference = (ctx, {canvasWidth, canvasHeight}, {min, max}, interval, reference, pivot) => {
    const range = Math.round((max-min)/interval);
    const widthRect = canvasWidth / range;
    let i;
    let j;
    let l;
    let r;

    let pivot_draw_pos;
    if(range % 2 === 0){
        pivot_draw_pos = (pivot - min)/interval * widthRect;
    }else{
        pivot_draw_pos = (pivot - min)/interval * widthRect + widthRect*0.5;
    }

    drawSteps(ctx, widthRect, interval, {canvasWidth, canvasHeight}, {min, max}, {pivot, drawPos: pivot_draw_pos});

    if(range <= 100 && interval === 1){
        i = Math.ceil(reference.length*.5);
        j = i - 1;
        l = canvasWidth*.5;
        r = l+widthRect;
        while (j >= 0)
        {
            let dnaWidth;
            let bsp = reference[j][0][0];
            let percentage = reference[j][0][1];
            if(percentage !== 0){
                dnaWidth = widthRect * percentage;
                drawLetter(ctx, canvasHeight, bsp, {x: l}, dnaWidth);
                j --;
                l -= dnaWidth;
            }
            if (i < reference.length) {
                bsp = reference[i][0][0];
                percentage = reference[i][0][1];
                if(percentage !== 0){
                    dnaWidth = widthRect * percentage;
                    drawLetter(ctx, canvasHeight, bsp, {x: r}, dnaWidth);
                    i ++;
                    r += dnaWidth;
                }
            }
        }
    }else{
        r = 0;
        let dnaWidth;
        let color;

        reference.forEach(arr => {
            arr.forEach(item => {
                dnaWidth = widthRect * item[1];
                color = selectColor(item[0]);
                drawLine(ctx, {x: r, y: canvasHeight*.875, x1: r+dnaWidth, y1: canvasHeight*.875}, {width: canvasHeight*.25, color: color}, "butt");
                r += dnaWidth;
            })
        });
    }
}

const drawReferenceFromPivot = (ctx, {canvasWidth, canvasHeight}, {min, max}, reference, newInterval, prevInterval, pivot, prevMin) => {
    const range = Math.round((max-min)/newInterval);
    const widthRect = canvasWidth / range;

    let pivot_draw_pos;
    if(range % 2 === 0){
        pivot_draw_pos = (pivot - min)/newInterval * widthRect;
    }else{
        pivot_draw_pos = (pivot - min)/newInterval * widthRect + widthRect*0.5;
    }

    drawSteps(ctx, widthRect, newInterval,  {canvasWidth, canvasHeight}, {min, max}, {pivot, drawPos: pivot_draw_pos});

    let i = Math.round((pivot - prevMin)/prevInterval);
    let j = i - 1;
    let r = pivot_draw_pos;
    let l = r - widthRect;

    let dnaWidth;
    if(range <= 100 && newInterval === 1){
        if(reference[i]){
            while (j >= 0)
            {
                drawLetter(ctx, canvasHeight, reference[j][0][0], {x: l}, widthRect);
                j --;
                l -= widthRect;
            }
            while (i < reference.length) {
                drawLetter(ctx, canvasHeight, reference[i][0][0], {x: r}, widthRect);
                i ++;
                r += widthRect;
            }
        }
    }else{
        if(reference[i]){
            r -= (widthRect * reference[i][0][1]);
            l = r;
            let color;
            while (j >= 0)
            {
                reference[j].forEach(item => {
                    dnaWidth = widthRect * item[1];
                    color = selectColor(item[0]);
                    drawLine(ctx, {x: l, y: canvasHeight*.875, x1: l - dnaWidth, y1: canvasHeight*.875}, {width: canvasHeight*.25, color: color}, "butt")
                    l -= dnaWidth;
                })
                j --;
            }
            while (i < reference.length) {
                reference[i].forEach(item =>{
                    dnaWidth = widthRect * item[1];
                    color = selectColor(item[0]);
                    drawLine(ctx, {x: r, y: canvasHeight*.875, x1: r + dnaWidth, y1: canvasHeight*.875}, {width: canvasHeight*.25, color: color}, "butt")
                    r += dnaWidth;
                })
                i ++;
            }
        }
    }
}

const drawReferenceFromLeft = (ctx, {canvasWidth, canvasHeight}, {min, max}, interval, reference, pivot) => {
    const range = Math.round((max-min)/interval);
    const widthRect = canvasWidth / range;
    const arrayLength = reference.length;

    let pivot_draw_pos;
    if(range % 2 === 0){
        pivot_draw_pos = (pivot - min)/interval * widthRect;
    }else{
        pivot_draw_pos = (pivot - min)/interval * widthRect + widthRect*0.5;
    }

    // drawSteps(ctx, widthRect, interval, {canvasWidth, canvasHeight}, {min, max}, {pivot: Math.ceil(reference.length*.5) - 1 + min, drawPos: canvasWidth*.5});
    drawSteps(ctx, widthRect, interval, {canvasWidth, canvasHeight}, {min, max}, {pivot, drawPos: pivot_draw_pos});
    let r = 0;
    if(range % 2 !== 0){
        r = widthRect/2;
    }

    let i = 0;
    if(range <= 100 && interval === 1){
        while (i < arrayLength) {
            drawLetter(ctx, canvasHeight, reference[i][0][0], {x: r}, widthRect);
            i ++;
            r += widthRect;
        }
    }else{
        let dnaWidth;
        let color;
        while (i < arrayLength) {
            reference[i].forEach(item => {
                dnaWidth = widthRect * item[1];
                color = selectColor(item[0]);
                drawLine(ctx, {x: r, y: canvasHeight*.875, x1: r + dnaWidth, y1: canvasHeight*.875}, {width: canvasHeight*.25, color: color}, "butt")
                r += dnaWidth;
            })
            i ++;
        }
    }
}

const drawReferenceFromRight = (ctx, {canvasWidth, canvasHeight}, {min, max}, interval, reference, pivot) => {
    const range = Math.round((max-min)/interval);
    const widthRect = canvasWidth / range;
    const arrayLength = reference.length;

    let pivot_draw_pos;
    if(range % 2 === 0){
        pivot_draw_pos = (pivot - min)/interval * widthRect;
    }else{
        pivot_draw_pos = (pivot - min)/interval * widthRect + widthRect*0.5;
    }

    // drawSteps(ctx, widthRect, interval, {canvasWidth, canvasHeight}, {min, max}, {pivot: Math.ceil(reference.length*.5) - 1 + min, drawPos: canvasWidth*.5});
    drawSteps(ctx, widthRect, interval, {canvasWidth, canvasHeight}, {min, max}, {pivot, drawPos: pivot_draw_pos});
    let r = canvasWidth;
    if(range % 2 !== 0){
        r = canvasWidth + widthRect/2;
    }

    let i = arrayLength - 1;
    if(range <= 100 && interval === 1){
        while (i >= 0) {
            drawLetter(ctx, canvasHeight, reference[i][0][0], {x: r}, widthRect);
            i --;
            r -= widthRect;
        }
    }else{
        let dnaWidth;
        let color;
        while (i >= 0) {
            reference[i].forEach(item => {
                dnaWidth = widthRect * item[1];
                color = selectColor(item[0]);
                drawLine(ctx, {x: r, y: canvasHeight*.875, x1: r - dnaWidth, y1: canvasHeight*.875}, {width: canvasHeight*.25, color: color}, "butt")
                r -= dnaWidth;
            })
            i --;
        }
    }
}

const drawSteps = (ctx, widthRect, interval, {canvasWidth, canvasHeight}, {min, max}, {pivot, drawPos}) => {
    ctx.font='15px Roboto';
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";

    const translateY = canvasHeight *.75;
    const translateX = canvasWidth - 10;

    //min
    ctx.translate(10, translateY);
    ctx.rotate(-Math.PI *.5);
    ctx.fillText(min, 5, 5);
    ctx.rotate(Math.PI *.5);
    ctx.translate(-10, -translateY);

    //pivot
    ctx.translate(drawPos, translateY);
    ctx.rotate(-Math.PI *.5);
    ctx.fillText(pivot, 5, 5);
    ctx.rotate(Math.PI *.5);
    ctx.translate(-drawPos, -translateY);

    //others
    const quarter = Math.round((max-min) * .25);
    const quarterInPixel = quarter/interval * widthRect;
    let i = pivot - quarter;
    let leftDrawPos = drawPos - quarterInPixel;
    let j = pivot + quarter;
    let rightDrawPos = drawPos + quarterInPixel;
    while(i > min){
        ctx.translate(leftDrawPos, translateY);
        ctx.rotate(-Math.PI *.5);
        ctx.fillText(i, 5, 5);
        ctx.rotate(Math.PI *.5);
        ctx.translate(-leftDrawPos, -translateY);

        i -= quarter;
        leftDrawPos -= quarterInPixel;
    }
    while(j < max){
        ctx.translate(rightDrawPos, translateY);
        ctx.rotate(-Math.PI *.5);
        ctx.fillText(j, 5, 5);
        ctx.rotate(Math.PI *.5);
        ctx.translate(-rightDrawPos, -translateY);

        j += quarter;
        rightDrawPos += quarterInPixel;
    }

    //max
    ctx.translate(translateX, translateY);
    ctx.rotate(-Math.PI *.5);
    ctx.fillText(max, 5, 5);
    ctx.rotate(Math.PI *.5);
    ctx.translate(-translateX, -translateY);
}