import React, { useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  makeStyles,
  Button,
} from '@material-ui/core';
import {moveLeft, moveRight, zoomIn, zoomOut} from '../actions/index';
import SearchContainer from './SearchContainer';
import { AiFillCaretLeft, AiFillCaretRight, AiOutlinePlus,  AiOutlineMinus} from 'react-icons/ai';

const ActionBar = ({moveLeft,
                    moveRight,
                    zoomIn,
                    zoomOut,
                    genomeViewer: {min, max, interval}}) => {
  const classes = useStyles();

  const handleMoveLeft = () => {
    moveLeft(2*interval, max-min);
  }

  const handleMoveRight = () => {
    moveRight(2*interval, max-min);
  }

  const handleZoomIn = () => {
    if(max-min>30) zoomIn(Math.round((max+min)/2), 2);
  }

  const handleZoomOut = () => {
    if(max-min<8000000) zoomOut(Math.round((max+min)/2), 2);
  }


  return(
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.controlArea}>
          <SearchContainer/>
        </div>
        <div className={classes.controlArea} style={{justifyContent: 'flex-end'}}>
          <Button variant="contained" color="primary"
          className={classes.button}
          onClick={handleMoveLeft}
          >
              <AiFillCaretLeft />
          </Button>
          <Button variant="contained" color="primary"
          className={classes.button}
          onClick={handleMoveRight}>
              <AiFillCaretRight />
          </Button>
          <Button variant="contained" color="primary"
          className={classes.button}
          onClick={handleZoomOut}>
              <AiOutlineMinus />
          </Button>
          <Button variant="contained" color="primary"
          className={classes.button}
          onClick={handleZoomIn}>
              <AiOutlinePlus />
          </Button>
        </div>
      </div>
    </div>
  );
};

ActionBar.propTypes = {
  genomeViewer: PropTypes.object.isRequired,
  moveLeft: PropTypes.func.isRequired,
  moveRight: PropTypes.func.isRequired,
  zoomIn: PropTypes.func.isRequired,
  zoomOut: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  genomeViewer: state.genomeViewer
});

export default React.memo(connect(mapStateToProps, {moveLeft, moveRight, zoomIn, zoomOut})(ActionBar));

//Style
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 16px",
    borderBottom: "1px solid #999FA5",
    boxSizing: "border-box",
    height: '3em',
  },
  container: {
    width: "100%",
    height: "100%",
    display: 'flex',
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  button: {
    fontSize: "14px",
    textAlign: "center",
    backgroundColor: "#19416D",
    height: "100%",
    marginLeft: '10px'
  },
  controlArea: {
    display: 'flex',
    justifyContent: 'space-betwwen',
    alignItems: 'center',
    height: "100%",
    width: '40%',
  },
}));