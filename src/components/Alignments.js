import React, {useEffect, useRef, Fragment, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    alignmentContainer: {
        height: "40%",
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

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


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


const drawAlignments = (ctx, {min,max}) => { 
    const alignments = [];
    const alignmentThickness = 500 / 60;
    const indicatorWidth = 2000 / (max - min);

    // Draw Alignments
    let y=alignmentThickness/2;
    for(let lineIndex=0; lineIndex < 60; lineIndex++){
        let i=0;
        let line = [];
        while(i < 2000){
            const length = getRandomInt(50,300);
            line.push({position: i, length: length});
            drawLine(ctx, { x: i, y: y, x1: (i+length), y1: y}, {color: "#e6e6e4", width: alignmentThickness}, "round");
            i += (length + getRandomInt(10,100));
        }
        alignments.push(line);
        y += alignmentThickness;
    }

    // Draw middle indicator
    drawLine(ctx, {x: 1000-(indicatorWidth/2), y: 500, x1: 1000-(indicatorWidth/2), y1: 0}, {color:"#000"}, "butt");
    drawLine(ctx, {x: 1000+(indicatorWidth/2), y: 500, x1: 1000+(indicatorWidth/2), y1: 0}, {color:"#000"}, "butt");
};


const drawCoverage = (ctx, data) => {
    const range = data.length -1;
    const widthRect = 2000 / range;
    let l = 2000/2;
    let r = l+widthRect;

    let i = Math.ceil(data.length/2);
    let j = i - 1;
    
    while (j >= 0)
    {
        drawLine(ctx, {x: l, y: 150, x1: l, y1: data[j]}, {width: widthRect, color:"#add8e6"}, "butt")
        j --;
        l -= widthRect;
        if (i < data.length) {
            drawLine(ctx, {x: r, y: 150, x1: r, y1: data[i]}, {width: widthRect, color:"#add8e6"}, "butt")
            i ++;
            r += widthRect;
        }
    }
};

const Alignments = ({data, genomeViewer:{min, max}}) => {
    const classes = useStyles();
    const ctxRef = useRef(null);

    const showCordinate = (e, id) => {
        const canvas = document.getElementById(id);
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        alert(`X: ${x}, Y: ${y}, width: ${canvas.scrollWidth}`);
        console.log(e);
    };

    useEffect(() => {
        let ctx = ctxRef.current;
        const alignmentCanvas = document.getElementById('alignments');
        ctx = alignmentCanvas.getContext("2d");
        ctx.clearRect(0, 0, alignmentCanvas.width, alignmentCanvas.height);
        drawAlignments(ctx, {min,max});


        const coverageCanvas = document.getElementById('coverage');
        ctx = coverageCanvas.getContext("2d");
        ctx.clearRect(0, 0, coverageCanvas.width, coverageCanvas.height);
        drawCoverage(ctx, data);
    }, [min, max]);

    return(
        <Fragment>
            <Grid container xs={12} className={classes.coverageContainer}>
                <Grid item xs={1} className={classes.labelContainer}>
                    <label className={classes.labelText}>COVERAGE</label>
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
                    <label className={classes.labelText}>ALIGNMENTS</label>
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
    data: PropTypes.array.isRequired,
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
    genomeViewer: state.genomeViewer,
    data: ownProps.data
});

export default connect(mapStateToProps, {})(Alignments);