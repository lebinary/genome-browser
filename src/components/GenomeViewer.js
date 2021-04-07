import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {zoomOut, zoomIn, moveLeft, moveRight, getData} from '../actions';
import {Grid, makeStyles } from '@material-ui/core';
import _ from 'lodash';

import Gene from './Gene';
import Coverage from './Coverage';
import Alignments from './Alignments';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '0 30px',
        height: '80vh',
        width: '100vw',
    },
    reference: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxHeight: '50px',
        width: '100%'
    },
    scaleBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxHeight: '50px',
    },
    coverage: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxHeight: '50px',
        width: '100%'
    },
    alignments: {
        height: '45vh',
        width: '100%',
        top: '0px',
        overflowY: 'scroll',
    },
    arrow: {
        height: '100%',
        width: '45%',
    },
    locationBar: {
        display: 'flex',
        alignItems: 'center',
    },
    label: {
        padding: '1em 0',
        fontSize: "12px",
        fontWeight: "bold",
    },
}));

const selectColor = (letter) => {
    let color;
    switch(letter){
        case "A":
            color = "#59CD90";
            break;
        case "T":
            color = "#c02f42";
            break;
        case "C":
            color = "#175676";
            break;
        case "G":
            color = "#F2DC5D";
            break;
        default:
            color = "#888"
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

const drawLetter = (ctx, letter, info = {}, width) => {
    const { x, y } = info;

    //Draw background
    let color = selectColor(letter);
    drawLine(ctx, {x: x, y: y+3, x1: x, y1: y-27}, {width: width, color: color}, "butt")

    ctx.beginPath();
    ctx.font='bold 30px Roboto';
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(letter, x, y);
    ctx.closePath();
}

const drawReference = (ctx, reference) => {
    const range = reference.length-1;
    const widthRect = 2000 / range;
    const splittedRef = reference.split("");
    let l = 2000/2;
    let r = l+widthRect;

    if(range <= 100){
        
        let i = Math.ceil(splittedRef.length/2);
        let j = i - 1;
        
        while (j >= 0)
        {
            drawLetter(ctx, splittedRef[j], {x: l, y: 41}, widthRect);
            j --;
            l -= widthRect;
            if (i < splittedRef.length) {
                drawLetter(ctx, splittedRef[i], {x: r , y: 41}, widthRect);
                i ++;
                r += widthRect;
            }
        }
    }else{
        let i = Math.ceil(splittedRef.length/2);
        let j = i - 1;
        
        while (j >= 0)
        {
            let color = selectColor(splittedRef[j]);
            drawLine(ctx, {x: l, y: 45, x1: l, y1: 15}, {width: widthRect, color: color}, "butt")
            j --;
            l -= widthRect;
            if (i < splittedRef.length) {
                let color = selectColor(splittedRef[i]);
                drawLine(ctx, {x: r, y: 45, x1: r, y1: 15}, {width: widthRect, color: color}, "butt")
                i ++;
                r += widthRect;
            }
        }
    }
}

const GenomeViewer = ({getData, zoomIn, zoomOut, moveLeft, moveRight, genomeViewer:{min, max, data, reference, title}}) => {
    const classes = useStyles();
    const [isDragging, setDragging] = useState(false);
    const [clientX, setClientX] = useState(null);
    let ctx = null;

    const handleWheel = e => {
        if (e.deltaY < 0) {
            if(max-min>10){
                zoomIn();
            }
        } else {
            if(max-min<1000000){
                zoomOut();
            }
        }
    }

    const onMouseDown = e => {
        setDragging(true);
        setClientX(e.clientX);
    };
    
    const onMouseUp = () => {
        setDragging(false);
    };
    
    const onMouseMove = e => {
        if (isDragging === true) {
            const canvasWidth = document.getElementById('reference').clientWidth;
            const unitPixel = canvasWidth / (max-min);
            //move right
            if(e.clientX < clientX){
                moveRight(Math.round((clientX - e.clientX)/unitPixel));
            }
            //move left
            else if(e.clientX > clientX){
                moveLeft(Math.round((e.clientX - clientX)/unitPixel));
            }
        }
    };

    const showCordinate = (e, id) => {
        const canvas = document.getElementById(id);
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        alert(`X: ${x}, Y: ${y}`);
        console.log(e);
    };

    useEffect(() => {
        const bounceGetData = _.debounce(() => {
            getData(title, {min, max});
        }, 350);
        bounceGetData();
    }, [min,max]);

    useMemo(() => {
        if(reference !== ""){
            const referenceCanvas = document.getElementById('reference');
            ctx = referenceCanvas.getContext("2d");
            ctx.clearRect(0, 0, referenceCanvas.width, referenceCanvas.height);
            return drawReference(ctx, reference);
        }
    }, [reference]);

    return(
        <Grid container className={classes.root} onWheel={handleWheel} spacing={1} draggable="false"         
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}>
            <Grid item xs={1}>
                <p className={classes.label}>REFERENCE</p>
            </Grid>
            <Grid className={classes.reference} item xs={11}>
                <canvas id="reference" width="2000" height="50" onClick={(e) => showCordinate(e, "reference")} style={{
                    width: '100%',
                    height: '100%',
                }}></canvas>
            </Grid>
            <Gene />
            <Coverage data={data} />
            <Alignments data={data}/>
        </Grid>
    );
};

GenomeViewer.propTypes = {
    getData: PropTypes.func.isRequired,
    zoomIn: PropTypes.func.isRequired,
    zoomOut: PropTypes.func.isRequired,
    moveLeft: PropTypes.func.isRequired,
    moveRight: PropTypes.func.isRequired,
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {getData, zoomIn, zoomOut, moveLeft, moveRight})(GenomeViewer);