import React, {Fragment, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AccordionDetails, Typography, makeStyles} from '@material-ui/core';
import {LIMIT_SIZE} from '../utils/globalConstant';
import { dbColors } from '../utils/globalConstant';
import {StyledAccordion, StyledAccordionSummary} from './customizedComponent';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const Gene = ({genomeViewer:{min, max, highlight, genes, genesType}}) => {
    const classes = useStyles();
    const ctxRef = useRef(null);
    const [popOver, setPopOver] = useState({
        open: false,
        x: 0,
        y: 0,
        content: {
            index: "",
            start: "",
            end: "",
        }
    });
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        if(genes !== null) {
            let colorIndex = 1;
            let ctx = ctxRef.current;

            //Clear canvas
            const genseCanvas = document.getElementById('genes');
            if(genseCanvas){
                ctx = genseCanvas.getContext("2d");
                ctx.clearRect(0, 0, genseCanvas.width, genseCanvas.height);
    
                let interval;
                if ((max+1) - min >= 500){
                    interval = Math.floor((max - min + LIMIT_SIZE) /  LIMIT_SIZE);
                }else{
                    interval = 1;
                }
    
                if(genesType === "summary"){
                    genes.forEach(gene => {
                        if(colorIndex === 6) colorIndex = 0;
                        drawGeneSummary(ctx, {min, max}, gene, dbColors[colorIndex]);
                        colorIndex++;
                    });
                }else{
                    genes.forEach((gene, geneIndex) => {
                        if(colorIndex === 6) colorIndex = 0;
                        const {transcript_index, direction, startPos, endPos, exons} = gene
                        
                        //Intron
                        drawGene(ctx, {min, max}, {startPos, endPos}, "intron", transcript_index, direction, dbColors[colorIndex]);
                        //Exons
                        exons.forEach(exon => {
                            drawGene(ctx, {min, max}, exon, "exon", transcript_index, direction, dbColors[colorIndex]);
                        })
                        if(transcript_index === 0 && geneIndex !== 0){
                            colorIndex++;
                        }
                    });
                }
                
                //Draw Indicator
                if(highlight.length > 0){
                    drawIndicator(ctx, {min, max}, {pos1: highlight[0], pos2: highlight[1]});
                }
            }
        }
    }, [min, max, genes, genesType, highlight]);

    const closePopover = () => {
        setPopOver({
            ...popOver,
            open: false,
            content: {}
        });
    }

    const handleChange = (event, newExpanded) => {
        setExpanded(newExpanded ? true : false);
    };

    const showCordinate = (e) => {
        closePopover();
        if(genesType === "details"){
            const canvas = document.getElementById('genes');
            const container = document.getElementById('container');
            const rect = canvas.getBoundingClientRect();
            let x = (e.clientX - rect.left)*2000/canvas.scrollWidth;
            let y = (e.clientY - rect.top)*500/canvas.scrollHeight;
    
            const ctx = canvas.getContext("2d");
            const p = ctx.getImageData(x, y, 1, 1).data;
            const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    
            const unitPixel = canvas.clientWidth / (max-min);
            
            if(hex !== "#000000") {
                if((max-min) % 2 === 0){
                    x = e.clientX - rect.left;
                    y = e.clientY - rect.top;
        
                    const posX = min + Math.round(x / unitPixel);
                    const posY = Math.floor(y/30);
                    const gene = genes.find(gene => {
                        const {transcript_index, startPos, endPos} = gene;
                        return (posY === parseInt(transcript_index)
                            && posX >= parseInt(startPos) 
                            && posX <= parseInt(endPos))
                    })
        
                    if(gene !== undefined){
                        setPopOver({open: true, 
                            x: e.clientX - container.getBoundingClientRect().left, 
                            y: e.clientY - container.getBoundingClientRect().top,
                            content: {
                                index: gene.transcript_index,
                                trans_id: gene.trans_id,
                                gene_id: gene.gene_id,
                                start: gene.startPos,
                                end: gene.endPos}
                        });
                    }
                }else{
                    x = e.clientX - rect.left;
                    y = e.clientY - rect.top;
                    const posX = min + Math.floor(x / unitPixel);
                    const posY = Math.floor(y/25);
                    const gene = genes.find(gene => {
                        const {transcript_index, startPos, endPos} = gene;
                        return (posY === parseInt(transcript_index)
                            && posX >= parseInt(startPos) 
                            && posX <= parseInt(endPos))
                    })
                    if(gene !== undefined){
                        setPopOver({
                            open: true, 
                            x: e.clientX - container.getBoundingClientRect().left, 
                            y: e.clientY - container.getBoundingClientRect().top,
                            content: {index: gene.transcript_index,
                                    trans_id: gene.trans_id,
                                    gene_id: gene.gene_id,
                                    start: gene.startPos,
                                    end: gene.endPos}
                        });
                    }
                }
            }
        }
    };

    return(
        <Fragment>
        <StyledAccordion expanded={expanded} onChange={handleChange}>
            <StyledAccordionSummary
            style={{zIndex: 2}}
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            >
                <Typography className={classes.heading}>Transcripts</Typography>
            </StyledAccordionSummary>
            <AccordionDetails style={{height: "150px"}}>
                <div className={classes.geneContainer} onMouseOver={closePopover}>
                    <div className={classes.geneBar}>
                        <canvas id="genes" 
                        width="2000" 
                        height="500"
                        aria-haspopup="true"
                        onMouseMove={showCordinate}
                        style={{
                            width: "100%",
                            height: "600px",
                        }}></canvas>
                    </div>
                </div>
            </AccordionDetails>
        </StyledAccordion>
        <div className={[classes.popover, classes.noSelect].join(" ")} 
        onMouseEnter={closePopover}
        style={{left: popOver.x, top: popOver.y, display: popOver.open? 'block':'none'}}>
            <p className={classes.lineText}>transcript id: {popOver.content.trans_id}</p>
            <p className={classes.lineText}>gene id: <b style={{fontWeight: 600}}>{popOver.content.gene_id}</b></p>
            <p className={classes.lineText}>{popOver.content.start} - {popOver.content.end}</p>
        </div>
        </Fragment>
    );
};

Gene.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
    genomeViewer: state.genomeViewer,
});

export default connect(mapStateToProps, {})(Gene);

//Style
const useStyles = makeStyles((theme) => ({
    geneContainer: {
        height: "100%",
        width: '100%',
        borderBottom: "1px solid #C0C0C0",
        padding: '10px 0'
    },
    geneBar: {
        position: 'relative',
        height: '100%',
        width: '100%',
        top: '0px',
        overflowY: 'auto',
        overscrollBehavior: 'none'
    },
    popover: {
        zIndex: 10,
        cursor: 'default',
        padding: '10px',
        position: 'absolute',
        borderRadius: '10px',
        fontSize: '10px',
        left: '50%',
        top: '50%',
        minHeight: '20px',
        minWidth: '20px',
        backgroundColor: 'rgb(229, 229, 229, .6)',
    },
    lineText: {
        margin: 0
    },
    heading: {
        fontSize: '12px',
        fontWeight: "bold"
    },
    '@global': {
        '::-webkit-scrollbar': {
            height: '5px',
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
    },
    noSelect: {
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
         '-khtml-user-select': 'none',
           '-moz-user-select': 'none',
            '-ms-user-select': 'none',
                'user-select': 'none',
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

const drawArrow = (ctx, x, direction, y, exonWidth, style) => {
    const { color, width } = style;

    ctx.beginPath();
    if(direction === "+"){
        ctx.moveTo(x-10, y+exonWidth/2);
        ctx.lineTo(x, y);
        ctx.lineTo(x-10, y-exonWidth/2);
    }else{
        ctx.moveTo(x+10,  y+exonWidth/2);
        ctx.lineTo(x, y);
        ctx.lineTo(x+10,  y-exonWidth/2);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
}

const drawGene = (ctx, {min, max}, node, type, lineNum, direction, color) => {
    const range = max-min;
    const unit = 2000 / range;

    const start = node.startPos;
    const end = node.endPos;

    if(!(start > max) && !(end < min)){
        //In range
        let x = 0;
        let x1 = 0;

        const exonWidth = 500/40;
        const intronWidth = exonWidth/2;
        const y = lineNum*(exonWidth*2)+exonWidth/2;

        //start position
        if(start <= max && start >= min){
            x = (start-min)*unit;
        }else{
            x = 0;
        };

        //end position
        if(end <= max && end >= min){
            x1 = (end-min)*unit;
        }else{
            x1 = 2000;
        }

        if((max-min) % 2 === 0){
            drawLine(ctx, { x: x-unit/2, y: y, x1: x1+unit/2, y1: y}, {width: type==="exon"?exonWidth:intronWidth, color: color}, "butt");
            if((max - min) <= 20000){
                drawArrow(ctx, (x1+x)/2, direction, y, exonWidth, {width: intronWidth/2, color: type==="exon"?"#fff":color});
            }
        }else{
            drawLine(ctx, { x: x, y: y, x1: x1+unit, y1: y}, {width: type==="exon"?exonWidth:intronWidth, color: color}, "butt");
            if((max - min) <= 20000){
                drawArrow(ctx, (x1+x)/2, direction, y, exonWidth, {width: intronWidth/2, color: type==="exon"?"#fff":color});
            }
        }
    }
}

const drawGeneSummary = (ctx, {min, max}, node, color) => {
    const range = max-min;
    const unit = 2000 / range;

    const start = node[0];
    const end = node[1];

    if(!(start > max) && !(end < min)){

        for(let lineNum=0; lineNum<node[2]; lineNum++) {
            //In range
            let x = 0;
            let x1 = 0;

            const exonWidth = 500/80;
            const intronWidth = exonWidth/2;
            const y = lineNum*(exonWidth*2)+exonWidth/2;

            //start position
            if(start <= max && start >= min){
                x = (start-min)*unit;
            }else{
                x = 0;
            };

            //end position
            if(end <= max && end >= min){
                x1 = (end-min)*unit;
            }else{
                x1 = 2000;
            }

            if((max-min) % 2 === 0){
                drawLine(ctx, { x: x-unit/2, y: y, x1: x1+unit/2, y1: y}, {width: intronWidth, color: color}, "butt");
            }else{
                drawLine(ctx, { x: x, y: y, x1: x1+unit, y1: y}, {width: intronWidth, color: color}, "butt");
            }
        }
    }
}

const drawIndicator = (ctx, {min, max}, {pos1, pos2}) => {
    const range = max-min;
    const widthRect = 2000 / range;
    if(pos1 === pos2){
        let x;
        if(range % 2 === 0){
            x = (pos1 - min) * widthRect - widthRect*0.5;
        }else{
            x = (pos1 - min) * widthRect;
        }
        drawLine(ctx, { x: x, y: 320, x1: x + widthRect, y1: 320}, {color: 'rgb(91, 91, 91, .05)', width: 640}, "butt");
    }else{
        if(!(pos1 > max) && !(pos2 < min)){
            //In range
            let x = 0;
            let x1 = 0;
    
            //start position
            if(pos1 <= max && pos1 >= min){
                x = (pos1-min)*widthRect;
            }else{
                x = 0;
            };
    
            //end position
            if(pos2 <= max && pos2 >= min){
                x1 = (pos2-min)*widthRect;
            }else{
                x1 = 2000;
            }
    
            if((max-min) % 2 === 0){
                drawLine(ctx, { x: x-widthRect/2, y: 320, x1: x1+widthRect/2, y1: 320}, {width: 640, color: 'rgb(91, 91, 91, .05)'}, "butt");
            }else{
                drawLine(ctx, { x: x, y: 320, x1: x1+widthRect, y1: 320}, {width: 640, color: 'rgb(91, 91, 91, .05)'}, "butt");
            }
        }
    }
}


const rgbToHex = (r, g, b) => {
    return ((r << 16) | (g << 8) | b).toString(16);
}