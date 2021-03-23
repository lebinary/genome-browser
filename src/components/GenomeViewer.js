import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {zoomOut, zoomIn, setVal, moveLeft, moveRight} from '../actions';
import {Typography, Grid, Button, makeStyles } from '@material-ui/core';
import Arrow from '@elsdoerfer/react-arrow';

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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

const letters = ["A", "T", "C", "G"];

const GenomeViewer = ({zoomIn, zoomOut, moveLeft, moveRight, genomeViewer:{min, max, value}}) => {
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
        ctx.closePath();
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

    const drawProtein = (info, style = {}) => {
        const { x, y, x1, y1 } = info;
        const { color = 'black', width = 1 } = style;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.lineCap = "round";
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.closePath();
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

            drawLine({ x: x, y: 60, x1: x1, y1: 60}, { width: type==="exon"?150-(range/2):120-(range/2), color: "#59CD90" });
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

    const drawReference = (reference) => {
        const range = max-min;
        const widthRect = 2000 / range;

        let x = 0
        
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
                drawLine({x: x, y: 50, x1: x, y1: 20}, {width: widthRect, color: color})
                x += widthRect;
            })
        }
    }

    useEffect(() => {
        let data = [];
        let reference = [];
        for(let i=0; i <= (max-min); i++){
            data.push(getRandomInt(0, 65));
            reference.push(letters[parseInt(getRandomInt(0,3))]);
        }

        //Reference
        const referenceCanvas = document.getElementById('reference');
        ctx = referenceCanvas.getContext("2d");
        ctx.clearRect(0, 0, referenceCanvas.width, referenceCanvas.height);
        drawReference(reference);

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

        const alignmentCanvas = document.getElementById('alignments');
        ctx = alignmentCanvas.getContext("2d");
        ctx.clearRect(0, 0, alignmentCanvas.width, alignmentCanvas.height);
        
        drawProtein({x: 5, y: 410, x1: 30, y1: 410}, {width: 10, color:"#add8e6"});

    }, [min, max]);

    return(
        <div className={classes.root} onWheel={handleScroll}>
            <Grid container className={classes.container} spacing={3}>
                <Grid item xs={1}>
                    <Typography id="discrete-slider-small-steps" gutterBottom>
                        Reference
                    </Typography>
                </Grid>
                <Grid className={classes.reference} item xs={11}>
                    <canvas id="reference" width="2000" height="50" style={{
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
                    <Button className={classes.arrow} onClick={()=>moveLeftRight('left')} size="large" color="primary">
                        <Arrow
                            angle={-90}
                            length={300}
                            style={{
                            width: '100%'
                            }}
                        />
                    </Button>
                    <Button size="medium" color="primary">
                        {max - min} bp
                    </Button>
                    <Button className={classes.arrow} onClick={()=>moveLeftRight('right')} size="large" color="primary">
                        <Arrow
                            angle={90}
                            length={300}
                            style={{
                            width: '100%'
                            }}
                        />
                    </Button>
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
                <Grid item xs={1}>
                    <Typography id="discrete-slider-small-steps" gutterBottom>
                        Alignments
                    </Typography>
                </Grid>
                <Grid item xs={11} className={classes.alignments}>
                        <canvas id="alignments" width="2000" height="500" style={{
                            width: "100%",
                            height: "900px",
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
    moveLeft: PropTypes.func.isRequired,
    moveRight: PropTypes.func.isRequired,
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {zoomIn, zoomOut, setVal, moveLeft, moveRight})(GenomeViewer);