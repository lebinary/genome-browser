import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {InputBase, Paper, Button, Container, makeStyles} from '@material-ui/core';
import {setRange} from '../actions';

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

const ActionBar = ({setRange}) => {
  const classes = useStyles();
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(from+10);

  const handleChangeFrom = (e) => {
    if(e.target.value > 0){
      setFrom(e.target.value);
    }else{
      setFrom(0);
    }
  };

  const handleChangeTo = (e) => {
    if(e.target.value > from+10){
      setTo(e.target.value);
    }else{
      setTo(from+10);
    }
  };

  const handleClick = (e) => {
    setRange({from, to});
  };

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
            placeholder="From"
            type="number"
            onChange={handleChangeFrom}
            value={from}
          />
          
          :

          <InputBase
            className={classes.input}
            placeholder="To"
            type="number"
            onChange={handleChangeTo}
            value={to}
          />
        </Paper>
        <Button variant="contained" color="primary" className={classes.button} onClick={handleClick}>
          Go
        </Button>
      </Container>
    </Fragment>
  );
};

ActionBar.propTypes = {
  setRange: PropTypes.func.isRequired,
};

export default connect(null, {setRange})(ActionBar);
