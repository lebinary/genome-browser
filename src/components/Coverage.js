import React, {useEffect, Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Typography, Grid, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    coverage: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxHeight: '50px',
        width: '100%'
    },
}));

const Coverage = ({data, genomeViewer:{min, max}}) => {
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
    
    const drawCoverage = (data) => {
        const range = max-min;
        const widthRect = 2000 / range;

        let x = 0;
        data.forEach(cov => {
            // drawRect({x: x, y: cov, x1: widthRect, y1: 150}, { color:'blue' });
            drawLine({x: x, y: 150, x1: x, y1: cov}, {width: widthRect, color:"#add8e6"}, "butt")
            x += widthRect;
        })
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
        const coverageCanvas = document.getElementById('coverage');
        ctx = coverageCanvas.getContext("2d");
        ctx.clearRect(0, 0, coverageCanvas.width, coverageCanvas.height);
        drawCoverage(data);

    }, [data]);

    return(
    <Fragment>
        <Grid item xs={1}>
            <Typography id="discrete-slider-small-steps" gutterBottom>
                Coverage
            </Typography>
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