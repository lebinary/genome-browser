import React, {useEffect, useRef, Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, makeStyles } from '@material-ui/core';
import 'fontsource-roboto';

const useStyles = makeStyles((theme) => ({
    geneContainer: {
        height: "10%",
    },
    geneBar: {
        height: "100%",
        display: 'flex',
        flexDirection: "column",
        justifyContent: "center",
        width: '100%',
    },
    label: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        color: "#172b4d"
    },
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
];

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

const drawGene = (ctx, {min, max}, node, type) => {
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
        };

        //end position
        if(node.end <= max && node.end >= min){
            x1 = (node.end-min)*unit;
        }else{
            x1 = 2000;
        }

        drawLine(ctx, { x: x, y: 60, x1: x1, y1: 60}, {width: type==="exon"?130:10, color: "#e6e6e4"}, "butt");
    }
}

const Gene = ({genomeViewer:{min, max}}) => {
    const classes = useStyles();
    const ctxRef = useRef(null);

    useEffect(() => {
        let ctx = ctxRef.current;
        //Clear canvas
        const genseCanvas = document.getElementById('genes');
        ctx = genseCanvas.getContext("2d");
        ctx.clearRect(0, 0, genseCanvas.width, genseCanvas.height);
        genes.forEach(gene => {
            //Exons
            gene.exons.forEach(exon => {
                drawGene(ctx, {min, max}, exon, "exon");
            });

            //Introns
            gene.introns.forEach(intron => {
                drawGene(ctx, {min, max}, intron, "intron");
            });
        });
    }, [min, max]);

    return(
        <Grid container className={classes.geneContainer} xs={12}>
            <Grid item className={classes.label} xs={1}>
                GENES
            </Grid>
            <Grid item xs={11} className={classes.geneBar}>
                <canvas id="genes" width="2000" height="150" style={{
                    width: '100%',
                    height: '70%',
                }}></canvas>
            </Grid>
        </Grid>
    );
};

Gene.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {})(Gene);