import React, {useEffect, Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Typography, Grid, makeStyles } from '@material-ui/core';

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

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const Alignments = ({data, genomeViewer:{min, max}}) => {
    const classes = useStyles();
    let ctx = null;

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

    const drawAlignments = () => {
        const alignments = [];
        const lineWidth = 500 / 60;

        let y=0;
        for(let lineIndex=0; lineIndex < 60; lineIndex++){
            let i=0;
            let line = [];
            while(i < 2000){
                const length = getRandomInt(50,300);
                line.push({position: i, length: length});
                drawLine({ x: i, y: y, x1: (i+length), y1: y}, {color: "#e6e6e4", width: lineWidth}, "round");
                i += (length + getRandomInt(10,100));
            }
            alignments.push(line);
            y += lineWidth;
        }
        return alignments;
    }

    const showCordinate = (e, id) => {
        const canvas = document.getElementById(id);
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        alert(`X: ${x}, Y: ${y}`);
        console.log(e);
    };

    useEffect(() => {
        const alignmentCanvas = document.getElementById('alignments');
        ctx = alignmentCanvas.getContext("2d");
        ctx.clearRect(0, 0, alignmentCanvas.width, alignmentCanvas.height);
        let alignments = drawAlignments();
    }, [min, max]);

    return(
    <Fragment>
        <Grid item xs={1}>
            <Typography id="discrete-slider-small-steps" gutterBottom>
                Alignments
            </Typography>
        </Grid>
        <Grid item xs={11} className={classes.alignments}>
            <canvas id="alignments" width="2000" height="500" onClick={(e) => showCordinate(e, "alignments")} style={{
                width: "100%",
                height: "600px",
            }}></canvas>
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