import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core';
import ActionBar from './ActionBar';
import GenomeViewer from './GenomeViewer';

const GenomeBrowser = () => {
    const classes = useStyles();

    return(
        <div className={classes.root}>
            <ActionBar />
            <GenomeViewer />
        </div>
    );
};

GenomeBrowser.propTypes = {
};

const mapStateToProps = (state) => ({
});

export default React.memo(connect(mapStateToProps, {})(GenomeBrowser));

//Style
const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
    },
}));