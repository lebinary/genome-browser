import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {InputBase, Paper, Button, Typography, makeStyles} from '@material-ui/core';
import {setRange, getData} from '../actions';
import mainLogo from '../img/vin_logo.png';

const useStyles = makeStyles((theme) => ({
    root: {
      padding: '10px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: "#E5E5E5",
      height: "10%",
    },
    searchArea: {
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
    range: {
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
    },
    iconButton: {
      padding: 10,
    },
    button: {
      textAlign: "center",
      backgroundColor: "#19416D",
    },
    titleArea: {
      height: "100%",
      position: "relative",
    },
    logo: {
      display: "block",
      width: "15%"
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
    setPos1('');
    setPos2('');
  }

  useEffect(() => {
    getData({min, max});
  }, []);

  return(
    <div className={classes.root}>
      <div className={classes.titleArea}>
        <img src={mainLogo} className={classes.logo} alt="vinbigdata"/>
      </div>
      <div className={classes.searchArea}>
        <Paper component="form" className={classes.paper}>
          <Typography variant="body2" className={classes.range}>
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
          </Typography>
        </Paper>
        <Button variant="contained" color="primary" disabled={((pos2-pos1<10) || pos2 === '' || pos1 === '')} className={classes.button} onClick={handleClick}>
            GO
        </Button>
      </div>
    </div>
  );
};

ActionBar.propTypes = {
  setRange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {getData, setRange})(ActionBar);
