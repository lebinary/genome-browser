import React, {useEffect, useMemo, useState, useRef} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {zoomOut, zoomIn, moveLeft, moveRight, getData, loadBamFile} from '../actions';
import {
    Grid,
    makeStyles } from '@material-ui/core';
import _ from 'lodash';

import Gene from './Gene';
import ErrorDialog from './ErrorDialog';
import Alignments from './Alignments';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "#e5e5e5",
        boxSizing: "border-box",
        padding: "1px",
        height: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        width: "95%",
        height: "95%",
        borderRadius: "10px",
        backgroundColor: "#fff",
        border: "1px solid #999FA5",
        padding: "0.5em 1em",
    },
    referenceContainer: {
        height: "10%",
        borderBottom: "1px solid #C0C0C0"
    },
    reference: {
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
    label: {
        display: "flex",
    },
    labelContainer: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    checkBox: {
        padding: "0"
    }
}));

const selectColor = (letter) => {
    let color;
    switch(letter) {
        case "A":
        case "a":
            color = "#59CD90";
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
    drawLine(ctx, {x: x, y: 0, x1: x, y1: 50}, {width: width, color: color}, "butt")

    ctx.beginPath();
    ctx.font='bold 30px Roboto';
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(letter, x, y-10);
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
            drawLetter(ctx, splittedRef[j], {x: l, y: 45}, widthRect);
            j --;
            l -= widthRect;
            if (i < splittedRef.length) {
                drawLetter(ctx, splittedRef[i], {x: r , y: 45}, widthRect);
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
            drawLine(ctx, {x: l, y: 0, x1: l, y1: 50}, {width: widthRect, color: color}, "butt")
            j --;
            l -= widthRect;
            if (i < splittedRef.length) {
                let color = selectColor(splittedRef[i]);
                drawLine(ctx, {x: r, y: 0, x1: r, y1: 50}, {width: widthRect, color: color}, "butt")
                i ++;
                r += widthRect;
            }
        }
    }
}

const GenomeViewer = ({getData, 
                        loadBamFile, 
                        zoomIn, 
                        zoomOut, 
                        moveLeft, 
                        moveRight, 
                        genomeViewer:{min, max,data, settings, reference, title, bamFile}}) => {
    const classes = useStyles();
    const [isDragging, setDragging] = useState(false);
    const [clientX, setClientX] = useState(null);
    const ctxRef = useRef(null);
    const {checkedReference, checkedGene, checkedAlignment} = settings;

    const handleWheel = e => {
        if(checkedReference || checkedGene || checkedAlignment){
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
    }

    const onMouseDown = e => {
        setDragging(true);
        setClientX(e.clientX);
    };
    
    const onMouseUp = () => {
        setDragging(false);
    };

    const bounceMoveLeft = _.throttle((range) => {
        moveLeft(1, range);
    }, 50);

    const bounceMoveRight = _.throttle((range) => {
        moveRight(1, range);
    }, 50);
    
    const onMouseMove = e => {
        if (isDragging === true) {
            const canvasWidth = document.getElementById('reference').scrollWidth;
            const unitPixel = canvasWidth / (max-min);

            //move right
            if(e.clientX < clientX && (clientX - e.clientX) > unitPixel ){
                //moveRight(Math.round((clientX - e.clientX)/unitPixel), max-min);
                bounceMoveRight(max-min);
            }
            //move left
            else if(e.clientX > clientX && (e.clientX - clientX) > unitPixel){
                //moveLeft(Math.round((e.clientX - clientX)/unitPixel), max-min);
                bounceMoveLeft(max-min);
            }
        }
    };

    const showCordinate = (e, id) => {
        const canvas = document.getElementById(id);

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if((max-min) % 2 === 0){
            const unitPixel = canvas.clientWidth / (max-min);
            alert(`position: ${min + Math.round(x / unitPixel)}`);
        }else{
            const unitPixel = canvas.clientWidth / (max-min);
            alert(`odd: ${(min + parseInt(x / unitPixel))}`);
        }
        console.log(e);
    };

    useEffect(() => {
        const bounceGetData = _.debounce(() => {
            getData(title, {min, max});

            if(bamFile !== null){
                loadBamFile(title, min, max, bamFile);
            };
        }, 350);
        bounceGetData();
    }, [min,max, getData, title, bamFile, loadBamFile]);

    useMemo(() => {
        if(reference !== "" && checkedReference){
            let ctx = ctxRef.current;
            const referenceCanvas = document.getElementById('reference');
            ctx = referenceCanvas.getContext("2d");
            ctx.clearRect(0, 0, referenceCanvas.width, referenceCanvas.height);
            return drawReference(ctx, reference);
        }
    }, [reference]);

    return(
        <div className={classes.root}>
            <Grid container className={classes.container} onWheel={handleWheel} draggable="false"         
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}>
                {checkedReference &&
                    <Grid container xs={12} className={classes.referenceContainer}>
                        <Grid item xs={1} className={classes.labelContainer}>
                            <div className={classes.label}>
                                <label className={classes.labelText}>REFERENCE</label>
                            </div>
                        </Grid>
                        <Grid className={classes.reference} item xs={11}>
                            <canvas id="reference" width="2000" height="50" onClick={(e) => showCordinate(e, "reference")} style={{
                                width: '100%',
                                height: '60%',
                            }}></canvas>
                        </Grid>
                    </Grid>
                }
                {checkedGene && <Gene />}
                {checkedAlignment && <Alignments data={data}/>}
            </Grid>
            <ErrorDialog />
        </div>
    );
};

GenomeViewer.propTypes = {
    getData: PropTypes.func.isRequired,
    zoomIn: PropTypes.func.isRequired,
    zoomOut: PropTypes.func.isRequired,
    moveLeft: PropTypes.func.isRequired,
    moveRight: PropTypes.func.isRequired,
    loadBamFile: PropTypes.func.isRequired,
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default React.memo(connect(mapStateToProps, {getData, zoomIn, zoomOut, moveLeft, moveRight, loadBamFile})(GenomeViewer));