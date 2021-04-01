import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {zoomOut, zoomIn, moveLeft, moveRight, getData} from '../actions';
import {Typography, Grid, Button, makeStyles } from '@material-ui/core';
import Arrow from '@elsdoerfer/react-arrow';
import _ from 'lodash';

import Gene from './Gene';
import Coverage from './Coverage';
import Alignments from './Alignments';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    container: {
        padding: '0 30px',
        height: '80vh',
        width: '100vw',
    },
    reference: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxHeight: '15%',
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

const drawLetter = (ctx, letter, info = {}) => {
    const { x, y } = info;
    ctx.beginPath();
    ctx.font="30px Arial";
    ctx.fillStyle = selectColor(letter);
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
            drawLetter(ctx, splittedRef[j], {x: l, y: 50});
            j --;
            l -= widthRect;
            if (i < splittedRef.length) {
                drawLetter(ctx, splittedRef[i], {x: r , y: 50});
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
            drawLine(ctx, {x: l, y: 50, x1: l, y1: 20}, {width: widthRect, color: color}, "butt")
            j --;
            l -= widthRect;
            if (i < splittedRef.length) {
                let color = selectColor(splittedRef[i]);
                drawLine(ctx, {x: r, y: 50, x1: r, y1: 20}, {width: widthRect, color: color}, "butt")
                i ++;
                r += widthRect;
            }
        }
    }
}


const GenomeViewer = ({getData, zoomIn, zoomOut, moveLeft, moveRight, genomeViewer:{min, max, data, reference}}) => {
    const classes = useStyles();
    const [isDragging, setDragging] = useState(false);
    const [clientX, setClientX] = useState(null);
    let ctx = null;

    const handleScroll = e => {
        if (e.nativeEvent.wheelDelta > 0) {
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
            //move right
            if(e.clientX < clientX){
                moveLeft(Math.round(clientX - e.clientX));
            }
            //move left
            else if(e.clientX > clientX){
                moveRight(Math.round(e.clientX - clientX));
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
            getData({min, max});
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
        <div className={classes.root} onWheel={handleScroll}>
            <Grid container className={classes.container} spacing={3} draggable="false"         
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}>
                <Grid item xs={1}>
                    <Typography id="discrete-slider-small-steps" gutterBottom>
                        Reference
                    </Typography>
                </Grid>
                <Grid className={classes.reference} item xs={11}>
                    <canvas id="reference" width="2000" height="50" onClick={(e) => showCordinate(e, "reference")} style={{
                        width: '100%',
                        height: '100%',
                    }}></canvas>
                </Grid>
                <Grid item xs={1}>
                    <Typography id="discrete-slider-small-steps" gutterBottom>
                        Scale
                    </Typography>
                </Grid>
                <Grid item xs={11} className={classes.scaleBar}>
                    <Arrow
                        angle={-90}
                        length={300}
                        style={{
                        width: '45%'
                        }}
                    />
                    <Button size="medium" color="primary">
                        {max-min} bp
                    </Button>
                    <Arrow
                        angle={90}
                        length={300}
                        style={{
                        width: '45%'
                        }}
                    />
                </Grid>
                {/* <Grid item xs={1}>
                    <Typography id="discrete-slider-small-steps" gutterBottom>
                        Position
                    </Typography>
                </Grid>
                <Grid item xs={11} className={classes.scaleBar}>
                    <Divider
                        style={{
                        width: '45%'
                        }}
                    />
                    <Button size="medium" onDoubleClick={handleDoubleClick} color="primary">
                        {(max + min)/2} bp
                    </Button>
                    <Divider
                        style={{
                        width: '45%'
                        }}
                    />
                </Grid> */}
                <Gene />
                <Coverage data={data} />
                <Alignments data={data}/>
            </Grid>
        </div>
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