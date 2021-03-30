import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {zoomOut, zoomIn, setVal, moveLeft, moveRight, getData} from '../actions';
import {Typography, Grid, Button, makeStyles } from '@material-ui/core';
import Arrow from '@elsdoerfer/react-arrow';

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

const GenomeViewer = ({getData, zoomIn, zoomOut, moveLeft, moveRight, genomeViewer:{min, max, value, data, reference}}) => {
    const classes = useStyles();
    const [isDragging, setDragging] = useState(false);
    const [clientX, setClientX] = useState(null);
    const [moveRange, setMoveRange] = useState(0);
    
    let ctx = null;

    const handleScroll = e => {
        if (e.nativeEvent.wheelDelta > 0) {
            if(max-min>10){
                zoomIn(value);
                getData();
            }
        } else {
            if(max-min<1000000){
                zoomOut(value);
                getData();
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
            const range = max-min;
            const widthRect = 2000 / range;

            //move right
            if(e.clientX < clientX){
                setMoveRange(clientX - e.clientX);
                console.log(Math.round(moveRange / widthRect));
            }
            //move left
            else if(e.clientX > clientX){
                setMoveRange(e.clientX - clientX);
                console.log(Math.round(moveRange / widthRect));

            }
        }
    };

    const handleDoubleClick = e => {
        alert('clicked');
    }

    const moveLeftRight = (direction) => {
        if(direction === 'left'){
            if(min>=10){
                moveLeft();
            }
        }else{
            if(max<=2999999990){
                moveRight();
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

    const drawLine = (info, style, lineCap = {}) => {
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

    const drawLetter = (letter, info = {}) => {
        const { x, y } = info;
        ctx.beginPath();
        ctx.font="30px Arial";

        switch(letter){
            case "A":
                ctx.fillStyle = "#59CD90";
                break;
            case "T":
                ctx.fillStyle = "#c02f42";
                break;
            case "C":
                ctx.fillStyle = "#175676";
                break;
            case "G":
                ctx.fillStyle = "#F2DC5D";
                break;
        }
        ctx.textAlign = "center";
        ctx.fillText(letter, x, y);
        ctx.closePath();
    }

    const drawReference = (reference) => {
        const range = max-min;
        const widthRect = 2000 / range;

        let x = 0;
        if(range <= 100){
            reference.forEach(letter => {
                drawLetter(letter, {x: x, y: 50})
                x += widthRect;
            })
        }else{
            reference.forEach(letter => {
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
                }
                drawLine({x: x, y: 50, x1: x, y1: 20}, {width: widthRect, color: color}, "butt")
                x += widthRect;
            });
        }
    }

    useEffect(() => {
        //Reference
        const referenceCanvas = document.getElementById('reference');
        ctx = referenceCanvas.getContext("2d");
        ctx.clearRect(0, 0, referenceCanvas.width, referenceCanvas.height);
        drawReference(reference);
    }, [min, max]);

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
                    <Button size="medium" onDoubleClick={handleDoubleClick} color="primary">
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
    setVal: PropTypes.func.isRequired,
    moveLeft: PropTypes.func.isRequired,
    moveRight: PropTypes.func.isRequired,
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {getData, zoomIn, zoomOut, setVal, moveLeft, moveRight})(GenomeViewer);