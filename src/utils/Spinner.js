import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core';

const Spinnner = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <style>
        {`
        .spinner .background {
          fill: none;
        }
        .spinner .line {
          animation: PacMan 5s infinite;
          fill: none;
          stroke: #55D1D0;
          stroke-width: 25;
        }
        .spinner .spinner {
          animation: Spin 2s infinite linear;
        }
        @keyframes PacMan {
          0% {
            stroke-dasharray: 79px 79;
          }
          50% {
            stroke-dasharray: 1px 79;
          }
          100% {
            stroke-dasharray: 79px 79;
          }
        }
        @keyframes Spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        `}
      </style>
      <svg className="spinner" width="80" height="80" viewBox="0 0 100 100">
        <circle className="background" r="24" cx="50" cy="50"></circle>
        <path
          className="line"
          d="M 37.5,50 C 37.5,43.096441 43.096441,37.5 50,37.5 C 56.903559,37.5 62.5,43.096441 62.5,50 C 62.5,56.903559 56.903559,62.5 50,62.5 C 43.096441,62.5 37.5,56.903559 37.5,50"
        ></path>
      </svg>
    </div>
  );
};

export default Spinnner;

const useStyles = makeStyles((theme) => ({
  root: {
    zIndex: 10,
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginTop: '-40px',
    marginLeft: '-40px',
    width: '50px',
    height: '50px',
  },
}))