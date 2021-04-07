import React, {useEffect, Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, makeStyles } from '@material-ui/core';
import 'fontsource-roboto';

const useStyles = makeStyles((theme) => ({
    geneBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxHeight: '50px',
    },
    label: {
        padding: '1em 0',
        fontSize: "12px",
        fontWeight: "bold",
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

const Gene = ({genomeViewer:{min, max}}) => {
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
            };

            //end position
            if(node.end <= max && node.end >= min){
                x1 = (node.end-min)*unit;
            }else{
                x1 = 2000;
            }

            drawLine({ x: x, y: 60, x1: x1, y1: 60}, {width: type==="exon"?130:10, color: "#e6e6e4"}, "butt");
        }
    }

    useEffect(() => {
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
    }, [min, max]);

    return(
        <Fragment>
            <Grid item xs={1}>
                <p className={classes.label}>GENES</p>
            </Grid>
            <Grid item xs={11} className={classes.geneBar}>
                <canvas id="genes" width="2000" height="150" style={{
                    width: '100%',
                    height: '100%',
                }}></canvas>
            </Grid>
        </Fragment>
    );
};

Gene.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {})(Gene);