import React, {useEffect, useRef, Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    coverage: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxHeight: '50px',
        width: '100%'
    },
    label: {
        padding: '1em 0',
        fontSize: "12px",
        fontWeight: "bold",
    },
}));

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

const Coverage = ({data, genomeViewer:{min, max}}) => {
    const classes = useStyles();
    const ctxRef = useRef(null);

    const showCordinate = (e, id) => {
        const canvas = document.getElementById(id);
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        alert(`X: ${x}, Y: ${y}`);
        console.log(e);
    };

    useEffect(() => {
        let ctx = ctxRef.current;
        const coverageCanvas = document.getElementById('coverage');
        ctx = coverageCanvas.getContext("2d");
        ctx.clearRect(0, 0, coverageCanvas.width, coverageCanvas.height);
        drawCoverage(ctx, data);
    }, [data]);

    return(
    <Fragment>
        <Grid item xs={1}>
            <p className={classes.label}>COVERAGE</p>
        </Grid>
        <Grid item xs={11} className={classes.coverage}>
            <canvas id="coverage" width="2000" height="150" onClick={(e) => showCordinate(e, "coverage")} style={{
                width: '100%',
                height: '100%',
            }}></canvas>
        </Grid>
    </Fragment>
    );
};

Coverage.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
    genomeViewer: state.genomeViewer,
    data: ownProps.data
});

export default connect(mapStateToProps, {})(Coverage);