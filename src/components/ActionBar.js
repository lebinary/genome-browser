import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {InputBase, Paper, Button, Container, makeStyles} from '@material-ui/core';
import {setRange, getData} from '../actions';

const useStyles = makeStyles((theme) => ({
    root: {
      padding: '10px 30px',
      display: 'flex',
      alignItems: 'stretch',
    },
    paper: {
      margin: '0 10px',
      display: 'flex',
      alignItems: 'center',
      width: 200,
      color: "#19416D"
    },
    paperLeft: {
      margin: '0 10px 0 0',
      display: 'flex',
      alignItems: 'center',
      width: 200,
      color: "#19416D"
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    button: {
      margin: '0px 10px',
      backgroundColor: "#19416D",
    }
}));

const ActionBar = ({getData, setRange, genomeViewer: {min, max}}) => {
  const classes = useStyles();
  const [pos1, setPos1] = useState('');
  const [pos2, setPos2] = useState('');

  const handleChangeFrom = (e) => {
    if(e.target.value != null){
      setPos1(e.target.value);
    }
  };

  const handleChangeTo = (e) => {
    if(e.target.value != null){
      setPos2(e.target.value);
    }
  };

  const handleClick = (e) => {
    setRange({pos1: parseInt(pos1), pos2: parseInt(pos2)});
  }

  useEffect(() => {
    getData({min, max});
  }, []);

  return(
    <Fragment>
      <Container className={classes.root} maxWidth="100%">
        {/* <Paper component="form" className={classes.paperLeft}>
          <InputBase
            className={classes.input}
            placeholder="Search"
          />
          <IconButton type="submit" className={classes.iconButton} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper> */}
        <Paper component="form" className={classes.paper}>
          <InputBase
            className={classes.input}
            placeholder={min}
            type="number"
            onChange={handleChangeFrom}
            value={pos1}
          />
          
          :

          <InputBase
            className={classes.input}
            placeholder={max}
            type="number"
            onChange={handleChangeTo}
            value={pos2}
          />
        </Paper>
        <Button variant="contained" color="primary" disabled={((pos2-pos1<10) || pos2 === '' || pos1 === '')} className={classes.button} onClick={handleClick}>
          Go
        </Button>
      </Container>
    </Fragment>
  );
};

ActionBar.propTypes = {
  setRange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {getData, setRange})(ActionBar);
