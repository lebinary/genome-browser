import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton, InputBase, Paper, Button, Container, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { lightBlue } from '@material-ui/core/colors';
import {toAddress} from '../actions';

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
      color: lightBlue
    },
    paperLeft: {
      margin: '0 10px 0 0',
      display: 'flex',
      alignItems: 'center',
      width: 200,
      color: lightBlue
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
    }
}));

const ActionBar = ({toAddress}) => {
  const classes = useStyles();
  const [address, setAddress] = useState(0);

  const handleChange = (e) => {
    setAddress(e.target.value);
  };

  const handleClick = (e) => {
    toAddress(address);
  };

  return(
    <Fragment>
      <Container className={classes.root} maxWidth="100%">
        <Paper component="form" className={classes.paperLeft}>
          <InputBase
            className={classes.input}
            placeholder="Search"
          />
          <IconButton type="submit" className={classes.iconButton} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
        <Paper component="form" className={classes.paper}>
          <InputBase
            className={classes.input}
            placeholder="DNA Address"
            type="number"
            onChange={handleChange}
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
  toAddress: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  // genomeViewer: state.genomeViewer
});

export default connect(null, {toAddress})(ActionBar);
