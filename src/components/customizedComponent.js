import React from 'react';
import {
    withStyles,
    TextField,
    Accordion,
    AccordionSummary,
} from '@material-ui/core';

export const StyledTextField = withStyles((theme) => ({
root: {
    textTransform: 'none',
    height: '100%',
    '& .MuiOutlinedInput-root': {
        padding: 0,
        height: '100%'
    },
    '& .MuiOutlinedInput-input': {
        padding: '0 5px !important',
        height: '100%',
    },
},
}))((props) => <TextField {...props} variant="outlined"/>);

export const StyledAccordion = withStyles((theme) => ({
root: {
    textTransform: 'none',
    borderBottom: '3px solid #e5e5e5',
    boxShadow: 'none',
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&:before': {
        display: 'none',
    },
    '&$expanded': {
        margin: 'auto',
    },
},
expanded: {},
}))((props) => <Accordion {...props}/>);

export const StyledAccordionSummary = withStyles((theme) => ({
root: {
    backgroundColor: '#e5e5e5',
    border: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 20,
    '&$expanded': {
        minHeight: 20,
    },
    '& .MuiIconButton-root': {
        padding: 0,
    },
},
content: {
    margin: 0,
    '&$expanded': {
        margin: 0,
    },
},
expanded: {},
}))((props) => <AccordionSummary {...props}/>);