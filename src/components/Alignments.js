import React, {useEffect, useRef, Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, makeStyles } from '@material-ui/core';

const Alignments = ({genomeViewer:{alignments, reference, min, max}}) => {
    const classes = useStyles();
    const ctxRef = useRef(null);

    const showCordinate = (e, id) => {
        const canvas = document.getElementById(id);
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left)*2000/canvas.scrollWidth;
        const y = (e.clientY - rect.top)*500/canvas.scrollHeight;

        const ctx = canvas.getContext("2d");
        const p = ctx.getImageData(x, y, 1, 1).data;
        const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

        alert(`X: ${x}, Y: ${y}, height: ${canvas.scrollHeight}, \n hex: ${hex}`);
    };

    useEffect(() => {
        if(alignments !== null){
            let ctx = ctxRef.current;
            const alignmentCanvas = document.getElementById('alignments');
            ctx = alignmentCanvas.getContext("2d");
            ctx.clearRect(0, 0, alignmentCanvas.width, alignmentCanvas.height);
            drawAlignments(ctx, mockData, reference, min, max);
    
            const coverageCanvas = document.getElementById('coverage');
            ctx = coverageCanvas.getContext("2d");
            ctx.clearRect(0, 0, coverageCanvas.width, coverageCanvas.height);
            drawCoverage(ctx, max, min);
        }
    }, [reference]);

    return(
        <Fragment>
            <Grid container xs={12} className={classes.coverageContainer}>
                <Grid item xs={1} className={classes.labelContainer}>
                    <label className={classes.labelText} draggable="false">COVERAGE</label>
                </Grid>
                <Grid item xs={11} className={classes.coverage}>
                    <canvas id="coverage" width="2000" height="150" onClick={(e) => showCordinate(e, "coverage")} style={{
                        width: '100%',
                        height: '100%',
                    }}></canvas>
                </Grid>
            </Grid>
            <Grid container xs={12} className={classes.alignmentContainer}>
                <Grid item xs={1} className={classes.labelContainer}>
                    <label className={classes.labelText} draggable="false">ALIGNMENTS</label>
                </Grid>
                <Grid item xs={11} className={classes.alignments}>
                    <canvas id="alignments" width="2000" height="500" onClick={(e) => showCordinate(e, "alignments")} style={{
                        width: "100%",
                        height: "600px",
                    }}></canvas>
                </Grid>
            </Grid>
        </Fragment>
    );
};

Alignments.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer,
});

export default connect(mapStateToProps, {})(Alignments);

//Styles
const useStyles = makeStyles((theme) => ({
    alignmentContainer: {
        height: "40%",
        borderBottom: "1px solid #C0C0C0",
    },
    alignments: {
        height: '100%',
        width: '100%',
        top: '0px',
        overflowY: 'auto',
    },
    coverageContainer: {
        height: "10%",
    },
    coverage: {
        height: "100%",
        display: 'flex',
        flexDirection: "column",
        justifyContent: "center",
        width: '100%',
    },
    labelText: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontWeight: "bold",
        color: "#172b4d",
        fontSize: "12px",
    },
    labelContainer: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },

    '@global': {
        '::-webkit-scrollbar': {
            height: '5px',
            width: '5px',
            zIndex: "1000",
        },
        
        '::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '2px',
        },

        '::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '2px',
        },
        
        '::-webkit-scrollbar-thumb:hover': {
            background: '#add8e6', 
        }
    }
}));


// Functions
const mockData = [
    {
        iteration: "1",
        pos1: "10001",
        pos2: "10021",
        des: "GTTTTTTTTTATTTTTTTTTG",
    }
]

const selectColor = (letter) => {
    let color;
    switch(letter) {
        case "A":
        case "a":
            color = "#59cd90";
            break;
        case "T":
        case "t":
            color = "#c02f42";
            break;
        case "C":
        case "c":
            color = "#175676";
            break;
        case "G":
        case "g":
            color = "#F2DC5D";
            break;
        default:
            color = "#e6e6e4"
    }
    return color;
}

const countGridatPosition = (posX) => {
    const alignmentThickness = 500 / 60;
    const canvas = document.getElementById('alignments');
    const ctx = canvas.getContext("2d");
    let count = 0;
    for(let y = alignmentThickness/2; y < 500; y+=alignmentThickness){
        const p = ctx.getImageData(posX, y, 1, 1).data;
        const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        if(hex === "#e6e6e4" 
        || hex === "#59cd90"
        || hex === "#c02f42"
        || hex === "#175676"
        || hex === "#f2dc5d") {
            count+=1;
        }
    }
    return count;
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

const drawAlignments = (ctx, alignments, reference, min, max) => {
    const alignmentThickness = 500 / 60;
    const widthRect = 2000 / (max - min);

    // Draw Alignments
    alignments.forEach(alignment => {
        const {iteration, pos1, pos2, des} = alignment;
        let y = (iteration*alignmentThickness) - alignmentThickness/2;
        let y1 = (iteration-1)*alignmentThickness;

        // left side
        if(pos1 <= min && pos2 >= min && pos2 <= max) {
            const str = des.slice(des.length - (parseInt(pos2)-min) -1, des.length);
            let l = 2000/2;
            let r = l+widthRect;
            let i = Math.ceil(str.length/2);
            let j = i - 1;

            if((max-min)%2 === 0){
                drawLine(ctx, { x: 0, y: y, x1: ((parseInt(pos2)-min) * widthRect + widthRect/2), y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");
                while (j >= 0)
                {
                    if(reference[j] !== str[j]) {
                        let color = selectColor(str[j]);
                        drawLine(ctx, {x: j*widthRect, y: y1, x1: j*widthRect, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                    }
                    j --;
                    l -= widthRect;
                    if (i < str.length) {
                        if(reference[i] !== str[i]) {
                            let color = selectColor(str[i]);
                            drawLine(ctx, {x: i*widthRect, y: y1, x1: i*widthRect, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                        }
                        i ++;
                        r += widthRect;
                    }
                }
            }else{
                drawLine(ctx, { x: 0, y: y, x1: ((parseInt(pos2)-min) * widthRect + widthRect), y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");
                while (j >= 0)
                {
                    if(reference[j] !== str[j]) {
                        let color = selectColor(str[j]);
                        drawLine(ctx, {x: j*widthRect+widthRect/2, y: y1, x1: j*widthRect+widthRect/2, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                    }
                    j --;
                    l -= widthRect;
                    if (i < str.length) {
                        if(reference[i] !== str[i]) {
                            let color = selectColor(str[i]);
                            drawLine(ctx, {x: i*widthRect+widthRect/2, y: y1, x1: i*widthRect+widthRect/2, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                        }
                        i ++;
                        r += widthRect;
                    }
                }
            }
        }

        //right side
        else if(pos2 >= max && pos1 <= max && pos1 >= min){
            //draw Outliers
            const str = des.slice(0, des.length - (parseInt(pos2)-max));
            let l = 2000/2;
            let r = l+widthRect;
            let i = Math.ceil(str.length/2);
            let j = i - 1;

            if((max-min)%2 === 0){
                drawLine(ctx, { x: ((parseInt(pos1)-min) * widthRect - widthRect/2), y: y, x1: 2000, y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");
                while (j >= 0)
                {
                    if(reference[parseInt(pos1)-min+j] !== str[j]) {
                        let color = selectColor(str[j]);
                        drawLine(ctx, {x: (parseInt(pos1)-min+j)*widthRect, y: y1, x1: (parseInt(pos1)-min+j)*widthRect, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                    }
                    j --;
                    l -= widthRect;
                    if (i < str.length) {
                        if(reference[parseInt(pos1)-min+i] !== str[i]) {
                            let color = selectColor(str[i]);
                            drawLine(ctx, {x: (parseInt(pos1)-min+i)*widthRect, y: y1, x1: (parseInt(pos1)-min+i)*widthRect, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                        }
                        i ++;
                        r += widthRect;
                    }
                }
            }else{
                drawLine(ctx, { x: 0, y: y, x1: 2000, y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");
                while (j >= 0)
                {
                    if(reference[parseInt(pos1)-min+j] !== str[j]) {
                        let color = selectColor(str[j]);
                        drawLine(ctx, {x: (parseInt(pos1)-min+j)*widthRect+widthRect/2, y: y1, x1: (parseInt(pos1)-min+j)*widthRect+widthRect/2, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                    }
                    j --;
                    l -= widthRect;
                    if (i < str.length) {
                        if(reference[parseInt(pos1)-min+i] !== str[i]) {
                            let color = selectColor(str[i]);
                            drawLine(ctx, {x: (parseInt(pos1)-min+i)*widthRect+widthRect/2, y: y1, x1: (parseInt(pos1)-min+i)*widthRect+widthRect/2, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                        }
                        i ++;
                        r += widthRect;
                    }
                }
            }
        }
        
        //in range
        else if(pos1 >= min && pos2 <= max){
            let l = 2000/2;
            let r = l+widthRect;
            let i = Math.ceil(des.length/2);
            let j = i - 1;

            if((max-min)%2===0){
                drawLine(ctx, { x: ((parseInt(pos1)-min) * widthRect - widthRect/2), y: y, x1: ((parseInt(pos2)-min) * widthRect + widthRect/2), y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");
                while (j >= 0)
                {
                    if(reference[parseInt(pos1)-min+j] !== des[j]) {
                        let color = selectColor(des[j]);
                        drawLine(ctx, {x: (parseInt(pos1)-min+j)*widthRect, y: y1, x1: (parseInt(pos1)-min+j)*widthRect, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                    }
                    j --;
                    l -= widthRect;
                    if (i < des.length) {
                        if(reference[parseInt(pos1)-min+i] !== des[i]) {
                            let color = selectColor(des[i]);
                            drawLine(ctx, {x: (parseInt(pos1)-min+i)*widthRect, y: y1, x1: (parseInt(pos1)-min+i)*widthRect, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                        }
                        i ++;
                        r += widthRect;
                    }
                }
            }else{
                drawLine(ctx, { x: ((parseInt(pos1)-min) * widthRect), y: y, x1: ((parseInt(pos2)-min) * widthRect + widthRect), y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");
                while (j >= 0)
                {
                    if(reference[parseInt(pos1)-min+j] !== des[j]) {
                        let color = selectColor(des[j]);
                        drawLine(ctx, {x: (parseInt(pos1)-min+j)*widthRect+widthRect/2, y: y1, x1: (parseInt(pos1)-min+j)*widthRect+widthRect/2, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                    }
                    j --;
                    l -= widthRect;
                    if (i < des.length) {
                        if(reference[parseInt(pos1)-min+i] !== des[i]) {
                            let color = selectColor(des[i]);
                            drawLine(ctx, {x: (parseInt(pos1)-min+i)*widthRect+widthRect/2, y: y1, x1: (parseInt(pos1)-min+i)*widthRect+widthRect/2, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                        }
                        i ++;
                        r += widthRect;
                    }
                }
            }
        }

        //over range
        else if(pos1 < min && pos2 > max){
            //drawLine(ctx, { x: 0, y: y, x1: 2000, y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");
            const str = des.slice(min - parseInt(pos1), max - parseInt(pos1)+1);
            let l = 2000/2;
            let r = l+widthRect;
            let i = Math.ceil(str.length/2);
            let j = i - 1;
            drawLine(ctx, { x: 0, y: y, x1: 2000, y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");

            if((max-min)%2===0){
                drawLine(ctx, { x: ((parseInt(pos1)-min) * widthRect - widthRect/2), y: y, x1: ((parseInt(pos2)-min) * widthRect + widthRect/2), y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");
                while (j >= 0)
                {
                    if(reference[j] !== des[j]) {
                        let color = selectColor(des[j]);
                        drawLine(ctx, {x: j*widthRect, y: y1, x1: j*widthRect, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                    }
                    j --;
                    l -= widthRect;
                    if (i < des.length) {
                        if(reference[i] !== des[i]) {
                            let color = selectColor(des[i]);
                            drawLine(ctx, {x: i*widthRect, y: y1, x1: i*widthRect, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                        }
                        i ++;
                        r += widthRect;
                    }
                }
            }else{
                drawLine(ctx, { x: ((parseInt(pos1)-min) * widthRect), y: y, x1: ((parseInt(pos2)-min) * widthRect + widthRect), y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "butt");
                while (j >= 0)
                {
                    if(reference[j] !== des[j]) {
                        let color = selectColor(des[j]);
                        drawLine(ctx, {x: j*widthRect+widthRect/2, y: y1, x1: j*widthRect+widthRect/2, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                    }
                    j --;
                    l -= widthRect;
                    if (i < des.length) {
                        if(reference[i] !== des[i]) {
                            let color = selectColor(des[i]);
                            drawLine(ctx, {x: i*widthRect+widthRect/2, y: y1, x1: i*widthRect+widthRect/2, y1: y1+alignmentThickness}, {width: widthRect, color:color}, "butt");
                        }
                        i ++;
                        r += widthRect;
                    }
                }
            }
        }
    });

    // Draw middle indicator
    drawLine(ctx, {x: 1000-(widthRect/2), y: 500, x1: 1000-(widthRect/2), y1: 0}, {color:"#000", width: 0.5}, "butt");
    drawLine(ctx, {x: 1000+(widthRect/2), y: 500, x1: 1000+(widthRect/2), y1: 0}, {color:"#000", width: 0.5}, "butt");
};

const drawCoverage = (coverageCtx, max, min) => {
    const range = max - min;
    const coverageUnitPixel = 150 / 60;
    const widthRect = 2000 / range;

    let l = 2000/2;
    let r = l+widthRect;
    let i = Math.ceil((range+1)/2);
    let j = i - 1;
    
    while (j >= 0)
    {
        const count = countGridatPosition(l);
        drawLine(coverageCtx, {x: l, y: 150, x1: l, y1: 150-(count*coverageUnitPixel)}, {width: widthRect, color:"#add8e6"}, "butt");
        j --;
        l -= widthRect;
        if (i < range) {
            const count = countGridatPosition(r);
            drawLine(coverageCtx, {x: r, y: 150, x1: r, y1: 150-(count*coverageUnitPixel)}, {width: widthRect, color:"#add8e6"}, "butt");
            i ++;
            r += widthRect;
        }
        else if(i===range){
            const count = countGridatPosition(2000-widthRect/4);
            drawLine(coverageCtx, {x: 2000, y: 150, x1: 2000, y1: 150-(count*coverageUnitPixel)}, {width: widthRect, color:"#add8e6"}, "butt");
        }
    }
};

const rgbToHex = (r, g, b) => {
    if (r > 255 || g > 255 || b > 255) {
        throw "Invalid color component";
    }
    return ((r << 16) | (g << 8) | b).toString(16);
}