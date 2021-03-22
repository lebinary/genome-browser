import React, {useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {zoomOut, zoomIn, setVal} from '../actions';
import { Slider, Typography, Grid, Button, makeStyles, withStyles } from '@material-ui/core';
import Arrow from '@elsdoerfer/react-arrow';
import Chart from 'chart.js';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    container: {
        padding: '0 30px'
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
        maxHeight: '100px',
        width: '100%'
    },
    locationBar: {
        display: 'flex',
        alignItems: 'center',
    },
    test: {
        height: '100%',
        width: '100%',
        color: 'red',
    }
}));

const genes = [
    {
        name: 'TP53',
        start: 500,
        end: 650,
        exons: [
            {
                start: 500,
                end: 550,
            },
            {
                start: 600,
                end: 620,
            }
        ],
        introns: [
            {
                start: 551,
                end: 599
            },
            {
                start: 621,
                end: 650
            }
        ]
    },
    {
        name: 'TP54',
        start: 700,
        end: 850,
        exons: [
            {
                start: 700,
                end: 750,
            },
            {
                start: 800,
                end: 820,
            }
        ],
        introns: [
            {
                start: 751,
                end: 799
            },
            {
                start: 821,
                end: 850
            }
        ]
    }
]

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const GenomeViewer = ({zoomIn, zoomOut, setVal, genomeViewer:{min, max, value}}) => {
    const classes = useStyles();
    let ctx = null;

    const handleScroll = e => {
        if (e.nativeEvent.wheelDelta > 0) {
            if(max-min>3){
                zoomIn(value);
            }
        } else {
            if(max-min<200){
                zoomOut(value);
            }
        }
    }

    const handleChange = (e, newVal) => {
        setVal(newVal);
    }

    const drawLine = (info, style = {}) => {
        const { x, y, x1, y1 } = info;
        const { color = 'black', width = 1 } = style;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
    }

    const drawGene = (node, type) => {
        const range = max-min;
        const unit = 2000 / range;
        if(!(node.start > max) && !(node.end < min)){
            //In range
            let x = 0;
            let x1 = 0;

            //start position
            if(node.start <= max && node.start >= min){
                x = (node.start-min)*unit;
            }else{
                x = 0;
            }

            //end position
            if(node.end <= max && node.end >= min){
                x1 = (node.end-min)*unit;
            }else{
                x1 = 2000;
            }

            drawLine({ x: x, y: 60, x1: x1, y1: 60}, { width: type=="exon"?150-(range/2):120-(range/2) });
        }
    }

    const drawCoverage = (data) => {
        const range = max-min;
        const widthRect = 2000 / range;

        let x = 0;
        let y = 150;

        data.forEach(cov => {
            // drawRect({x: x, y: cov, x1: widthRect, y1: 150}, { color:'blue' });
            drawLine({x: x, y: 150, x1: x, y1: cov}, {width: widthRect, color:"#add8e6"})
            x += widthRect;
        })
    }

    useEffect(() => {
        let data = [];
        let labels = [];
        for(let i=0; i <= (max-min); i++){
            data.push(getRandomInt(0, 65));
            labels.push(i);
        }

        //Clear canvas
        const genseCanvas = document.getElementById('genes');
        ctx = genseCanvas.getContext("2d");
        ctx.clearRect(0, 0, genseCanvas.width, genseCanvas.height);

        genes.forEach(gene => {
            //Exons
            gene.exons.forEach(exon => {
                drawGene(exon, "exon");
            });

            //Introns
            gene.introns.forEach(intron => {
                drawGene(intron, "intron");
            });
        });

        const coverageCanvas = document.getElementById('coverage');
        ctx = coverageCanvas.getContext("2d");
        ctx.clearRect(0, 0, coverageCanvas.width, coverageCanvas.height);
        drawCoverage(data);
        // ctx.clearRect(0, 0, coverageCanvas.width, coverageCanvas.height);

        // let coverageChart = new Chart(ctx, {
        //     type: 'bar',
        //     data: {
        //         labels: labels,
        //         datasets: [{
        //             label: 'Coverage',
        //             data: data,
        //             backgroundColor: 'rgba(54, 162, 235, 0.2)',
        //         }]
        //     },
        //     options: {
        //         animation: {
        //             duration: 0 // general animation time
        //         },
        //         hover: {
        //             animationDuration: 0 // duration of animations when hovering an item
        //         },
        //         responsiveAnimationDuration: 0, // animation duration after a resize
        //         scales: {
        //             xAxes: [{
        //                 gridLines: {
        //                     offsetGridLines: true
        //                 }
        //             }],
        //             yAxes: [{
        //                 ticks: {
        //                     beginAtZero: true
        //                 }
        //             }]
        //         }
        //     }
        // });
    }, [min, max]);

    return(
        <div className={classes.root} onWheel={handleScroll}>
            <Grid container className={classes.container} spacing={3}>
                <Grid item xs={1}>
                    <Typography id="discrete-slider-small-steps" gutterBottom>
                        Reference
                    </Typography>
                </Grid>
                <Grid item xs={11}>
                    <Slider
                    defaultValue={Math.round((max-min)/2)}
                    aria-labelledby="discrete-slider-small-steps"
                    onChange={handleChange}
                    value={value}
                    step={1}
                    marks
                    min={min}
                    max={max}
                    valueLabelDisplay="auto"
                    />
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
                        {max - min} bp
                    </Button>
                    <Arrow
                        angle={90}
                        length={300}
                        style={{
                        width: '45%'
                        }}
                    />
                </Grid>
                <Grid item xs={1}>
                    <Typography id="discrete-slider-small-steps" gutterBottom>
                        Genes
                    </Typography>
                </Grid>
                <Grid item xs={11} className={classes.scaleBar}>
                    <canvas id="genes" width="2000" height="150" style={{
                        width: '100%',
                        height: '100%',
                    }}></canvas>
                </Grid>
                <Grid item xs={1}>
                    <Typography id="discrete-slider-small-steps" gutterBottom>
                        Coverage
                    </Typography>
                </Grid>
                <Grid item xs={11} className={classes.coverage}>
                    <canvas id="coverage" width="2000" height="150" style={{
                        width: '100%',
                        height: '100%',
                    }}></canvas>
                </Grid>
            </Grid>
        </div>
    );
};

GenomeViewer.propTypes = {
    zoomIn: PropTypes.func.isRequired,
    zoomOut: PropTypes.func.isRequired,
    setVal: PropTypes.func.isRequired,
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {zoomIn, zoomOut, setVal})(GenomeViewer);