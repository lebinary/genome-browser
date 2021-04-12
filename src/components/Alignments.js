import React, {useEffect, useRef, Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    alignmentContainer: {
        height: "60%",
    },
    alignments: {
        height: '100%',
        width: '100%',
        top: '0px',
        overflowY: 'auto',
    },
    label: {
        height: "100%",
        padding: "1em 0 0 0",
        fontSize: "12px",
        fontWeight: "bold",
        color: "#172b4d"
    },

    '@global': {
        '::-webkit-scrollbar': {
            width: '5px',
            zIndex: "1000",
        },
        
        '::-webkit-scrollbar-track': {
            opacity: "0",
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
    }, [min, max]);

    return(
    <Grid container xs={12} className={classes.alignmentContainer}>
        <Grid item xs={1} className={classes.label}>
            ALIGNMENTS
        </Grid>
        <Grid item xs={11} className={classes.alignments}>
            <canvas id="alignments" width="2000" height="500" onClick={(e) => showCordinate(e, "alignments")} style={{
                width: "100%",
                height: "600px",
            }}></canvas>
        </Grid>
    </Grid>
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