import React, {useState} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Checkbox, Popover, makeStyles} from '@material-ui/core';
import {setFilter} from '../actions/index';

const FilterPanel = ({setFilter, openFilter, setOpenFilter, genomeViewer:{checked}}) => {
    const classes = useStyles();

    const handleToggle = (e) => {
        const currentIndex = checked.indexOf(e.target.id);
        const newChecked = [...checked];
    
        if (currentIndex === -1) {
            newChecked.push(e.target.id);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setFilter(newChecked);
    };
  
    const handleClose = () => {
        setOpenFilter(null);
    };
  
    const open = Boolean(openFilter);
    const id = open ? 'simple-popover' : undefined;

    return(
        <Popover
            id={id}
            open={open}
            anchorEl={openFilter}
            className={classes.popover}
            style={{backgroundColor: 'transparent'}}
            onClose={handleClose}
            anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
            }}
        >
            <Grid container className={classes.popContent}>
                <Grid item xs={4} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('0') !== -1}
                        id={'0'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#A9D1F7', border: '1px #8a8a8a solid'}} />
                    1000Gp3_AF
                </Grid>
                <Grid item xs={8} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('6') !== -1}
                        id={'6'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#63acf0', border: '1px #63acf0 solid'}} />
                    gnomAD_genomes_controls_AF
                </Grid>
                <Grid item xs={4} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('1') !== -1}
                        id={'1'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#FFB1B0', border: '1px #8a8a8a solid'}} />
                    1000Gp3_AFR_AF
                </Grid>
                <Grid item xs={8} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('7') !== -1}
                        id={'7'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#ff6564', border: '1px #ff6564 solid'}} />
                    gnomAD_genomes_controls_AFR_AF
                </Grid>
                <Grid item xs={4} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('2') !== -1}
                        id={'2'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#FFDFBE', border: '1px #8a8a8a solid'}} />
                    1000Gp3_EUR_AF
                </Grid>
                <Grid item xs={8} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('10') !== -1}
                        id={'10'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#ffb972', border: '1px #ffb972 solid'}} />
                    gnomAD_genomes_controls_NFE_AF
                </Grid>
                <Grid item xs={4} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('3') !== -1}
                        id={'3'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#CC99FF', border: '1px #8a8a8a solid'}} />
                    1000Gp3_AMR_AF
                </Grid>
                <Grid item xs={8} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('8') !== -1}
                        id={'8'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#a64dff', border: '1px #a64dff solid'}} />
                    gnomAD_genomes_controls_AMR_AF
                </Grid>
                <Grid item xs={4} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('4') !== -1}
                        id={'4'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#FFFFBF', border: '1px #8a8a8a solid'}} />
                    1000Gp3_EAS_AF
                </Grid>
                <Grid item xs={8} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('9') !== -1}
                        id={'9'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#ffff73', border: '1px #ffff73 solid'}} />
                    gnomAD_genomes_controls_EAS_AF
                </Grid>
                <Grid item xs={4} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('5') !== -1}
                        id={'5'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#B4F0A7', border: '1px #8a8a8a solid'}} />
                    1000Gp3_SAS_AF
                </Grid>
                <Grid item xs={8} className={classes.gridLine}>
                    <Checkbox
                        className={classes.checkBox}
                        checked={checked.indexOf('11') !== -1}
                        id={'11'}
                        color="primary"
                        onClick={handleToggle}
                    />
                    <div className={classes.legend} 
                    style={{backgroundColor: '#7ce566', border: '1px #7ce566 solid'}} />
                    gnomAD_genomes_controls_POPMAX_AF
                </Grid>
            </Grid>
        </Popover>
    );
};

FilterPanel.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired,
    openFilter: PropTypes.bool.isRequired,
    setOpenFilter: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
    genomeViewer: state.genomeViewer,
    openFilter: ownProps.openFilter,
    setOpenFilter: ownProps.setOpenFilter
});

export default connect(mapStateToProps, {setFilter})(FilterPanel);

//Style
const useStyles = makeStyles((theme) => ({
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
    popContent: {
        display: 'flex',
        width: '400px',
        padding: '10px',
        overflow: 'hidden'
    },
    legend: {
        height: '10px',
        width: '10px',
        marginRight: '2px'
    },
    gridLine: {
        display: 'flex',
        alignItems: 'center',
        width: '10px',
        paddingBottom: '2px'
    },
    checkBox: {
        padding: 0,
    },
}));