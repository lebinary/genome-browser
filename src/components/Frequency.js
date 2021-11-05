import React, {Fragment, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeStyles, IconButton, AccordionDetails, Typography} from '@material-ui/core';
import {RiFilter2Fill} from 'react-icons/ri';
import {LIMIT_SIZE, freqColors} from '../utils/globalConstant';
import {setFilter} from '../actions/index';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {StyledAccordion, StyledAccordionSummary} from './customizedComponent';
import FilterPanel from './FilterPanel';

const Frequency = ({genomeViewer:{min, max, frequencies, highlight, snpFields, checked}}) => {
    const classes = useStyles();
    const ctxRef = useRef(null);
    const [popOver, setPopOver] = useState({
        open: false,
        x: 0,
        y: 0,
        content: {
            pos: "",
            db: "",
            fScore: "",
        }
    });
    const [openFilter, setOpenFilter] = useState(false);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        let ctx = ctxRef.current;
        const freqCanvas = document.getElementById('frequencies');
        if(freqCanvas){
            ctx = freqCanvas.getContext("2d");
            ctx.clearRect(0, 0, freqCanvas.width, freqCanvas.height);
            let interval;
            if ((max+1) - min >= 500){
                interval = Math.floor((max - min + LIMIT_SIZE) /  LIMIT_SIZE);
            }else{
                interval = 1;
            }
    
            //Draw Frequencies
            if(frequencies !== null) {
                drawFrequency(ctx, frequencies, {min , max}, interval, checked);
            }
    
            //Draw Indicator
            if(highlight.length > 0){
                drawIndicator(ctx, {min, max}, {pos1: highlight[0], pos2: highlight[1]});
            }
    
            //Draw Scale
            const logUnit = 600 / 6;
            drawLine(ctx, { x: 0, y: 320, x1: 80, y1: 320}, {color: 'rgb(255, 255, 255, .6)', width: 640}, "butt");
            for(let i=0; i < 7; i++){
                const y = i*logUnit + 20;
                drawLine(ctx, { x: 80, y: y, x1: 2000, y1: y}, {color: "#e6e6e4", width: 3}, "butt");
                drawLetter(ctx, benchMarks[i], {x: 0, y: y});
            }
        }
    }, [min, max, frequencies, checked]);

    const handleClick = (event) => {
        event.stopPropagation();
        setOpenFilter(event.currentTarget);
    };

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
        if(frequencies !== null){
            const canvas = document.getElementById('frequencies');
            const container = document.getElementById('container');
            const rect = canvas.getBoundingClientRect();
            const y = (e.clientY - rect.top)*640/canvas.scrollHeight;
            const unitPixel = canvas.clientWidth / (max-min);
        
            if((max-min) % 2 === 0){
                const posX = min + Math.round((e.clientX - rect.left) / unitPixel);
    
                const details = frequencies.details.filter(detail => {
                    return posX === detail[1];
                })
                if(details){
                    for(let j = 0; j < details.length; j++){
                        const detail = details[j];
                        let f_score;
                        for(let i = detail.length; i >= 12; i--){
                            if(checked.indexOf((i-12).toString()) !== -1){
                                let data = detail[i];
                                if(data !== '.'){
                                    const pixelY = convertDecimalToLogPixel(data);
                                    if(pixelY <= y && y <= (pixelY+40)) {
                                        f_score = data;
            
                                        setPopOver({
                                            open: true, 
                                            x: e.clientX - container.getBoundingClientRect().left, 
                                            y: e.clientY - container.getBoundingClientRect().top,
                                            content: {pos: `chr${detail[0]}: ${posX}`,
                                                    db: snpFields[i],
                                                    fScore: f_score}
                                        });
                                        break;
                                    };
                                    
                                }
                            }
                        }
                    }
                }
            }else{
                const posX = min + Math.floor((e.clientX - rect.left) / unitPixel);
                const details = frequencies.details.filter(detail => {
                    return posX === detail[1];
                })
                if(details){
                    for(let j = 0; j < details.length; j++){
                        const detail = details[j];
                        let f_score;
                        for(let i = detail.length; i >= 12; i--){
                            if(checked.indexOf((i-12).toString()) !== -1){
                                let data = detail[i];
                                if(data !== '.'){
                                    const pixelY = convertDecimalToLogPixel(data);
                                    if(pixelY <= y && y <= (pixelY+40)) {
                                        f_score = data;
            
                                        setPopOver({
                                            open: true, 
                                            x: e.clientX - container.getBoundingClientRect().left, 
                                            y: e.clientY - container.getBoundingClientRect().top,
                                            content: {pos: `chr${detail[0]}: ${posX}`,
                                                    db: snpFields[i],
                                                    fScore: f_score}
                                        });
                                        break;
                                    };
                                    
                                }
                            }
                        }

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
                <Typography className={classes.heading}>Frequencies</Typography>
                <IconButton
                className={classes.btn}
                onClick={handleClick}
                >
                    <RiFilter2Fill/>
                </IconButton>
            </StyledAccordionSummary>
            <AccordionDetails style={{height: "150px"}}>
                <div className={classes.geneContainer} onMouseOver={closePopover}>
                    <div className={classes.geneBar}>
                        <canvas id="frequencies"
                        width="2000"
                        height="640"
                        onMouseMove={showCordinate}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}></canvas>
                    </div>
                </div>
            </AccordionDetails>
        </StyledAccordion>
        <FilterPanel openFilter={openFilter} setOpenFilter={setOpenFilter} />
        <div className={[classes.popover, classes.noSelect].join(" ")}
        onMouseEnter={closePopover}
        style={{left: popOver.x, top: popOver.y, display: popOver.open? 'block':'none', textAlign: 'center'}}>
            <p className={classes.lineText} style={{fontWeight: 600}}>{popOver.content.pos}</p>
            <p className={classes.lineText}>{popOver.content.db}</p>
            <p className={classes.lineText}>f = {popOver.content.fScore}</p>
        </div>
        </Fragment>
    );
};

Frequency.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {setFilter})(Frequency);

//Style
const useStyles = makeStyles((theme) => ({
    geneContainer: {
        height: "100%",
        width: '100%',
        padding: '10px 0',
    },
    geneBar: {
        height: '100%',
        width: '100%',
        top: '0px',
        overflowY: 'hidden',
        position: 'relative'
    },
    heading: {
        fontSize: '12px',
        fontWeight: "bold"
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
    noSelect: {
        '-webkit-touch-callout': 'none',
        '-webkit-user-select': 'none',
         '-khtml-user-select': 'none',
           '-moz-user-select': 'none',
            '-ms-user-select': 'none',
                'user-select': 'none',
    },
    btn: {
        padding: 0,
        height: '1rem',
        fontSize: "14px",
        width: '2em', 
        textTransform: 'none', 
        padding: '10px',
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
    }
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

const drawRec = (ctx, info, style, lineCap = {}) => {
    const { x, y, x1, y1 } = info;
    const { color = 'black', border='black', width = 1 } = style;
    
    ctx.beginPath();
    ctx.rect(x, y, x1, y1);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = width;
    ctx.strokeStyle = border;
    ctx.stroke();
}

const drawLetter = (ctx, letter, info = {}) => {
    const { x, y } = info;
    ctx.beginPath();
    ctx.font='30px Times New Roman';
    ctx.fillStyle = "#a1a1a1";
    ctx.textAlign = "left";
    ctx.fillText(letter, x, y);
    ctx.closePath();
}

const drawFrequency = (ctx, frequencies, {min, max}, interval, filterArr) => {
    const range = Math.round((max-min)/interval);
    const widthRect = 2000 / range;

    frequencies.details.forEach(detail => {
        let freqX;
        if(range % 2 === 0){
            freqX = (detail[1] - min)/interval * widthRect - widthRect*0.5;
        }else{
            freqX = (detail[1] - min)/interval * widthRect;
        }
        for(let i = 0; i <= 11; i++){
            if(filterArr.indexOf(i.toString()) !== -1){
                let data = detail[i+12];
                if(data !== '.'){
                    const freqY = convertDecimalToLogPixel(data);
                    drawRec(ctx, { x: freqX + widthRect*0.25, y: freqY, x1: 0.5*widthRect, y1: 40}, {color: freqColors[i][0], border: freqColors[i][1], width: 2});
                }
            }
        }
    })

    frequencies.summary.forEach(summary => {
        let freqX;
        if(range % 2 === 0){
            freqX = (summary[0] - min)/interval * widthRect - widthRect*0.5;
        }else{
            freqX = (summary[0] - min)/interval * widthRect;
        }

        const dataY = summary[1];
        dataY.forEach((data, dataIndex) => {
            if(filterArr.indexOf(dataIndex.toString()) !== -1){
                data.forEach((interval) => {
                    const topY =  convertDecimalToLogPixel(interval[0]) + 20;
                    const bottomY =   convertDecimalToLogPixel(interval[1]) + 20;
                    drawRec(ctx, { x: freqX + widthRect*0.25, y: topY, x1:  0.5*widthRect, y1: bottomY-topY}, {color: freqColors[dataIndex][0], border: freqColors[dataIndex][1], width: 2});
                })
            }
        })
    })
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

const convertDecimalToLogPixel = (decimalNum) => {
    if(decimalNum == 0){
        return  (Math.log10(0.000001) + 6) * 100;
    }
    return  (Math.log10(decimalNum) + 6) * 100;
};

const benchMarks = [
    '0',
    '10e-5',
    '10e-4',
    '0.001',
    '0.01',
    '0.1',
    '1',
];