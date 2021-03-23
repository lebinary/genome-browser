import {
    ZOOM_IN,
    ZOOM_OUT,
    SET_VALUE,
    TO_ADDRESS,
    MOVE_LEFT,
    MOVE_RIGHT,
} from '../types';
import axios from 'axios';

export const zoomIn = (value) => (dispatch) => {
    dispatch({
        type: ZOOM_IN,
        payload: value,
    });
};
  
export const zoomOut = (value) => (dispatch) => {
    dispatch({
        type: ZOOM_OUT,
        payload: value,
    });
};

export const setVal = (value) => (dispatch) => {
    dispatch({
        type: SET_VALUE,
        payload: value,
    });
};

export const toAddress = (value) => (dispatch) => {
    dispatch({
        type: TO_ADDRESS,
        payload: value,
    });
};

export const moveLeft = () => (dispatch) => {
    dispatch({
        type: MOVE_LEFT,
    });
};

export const moveRight = () => (dispatch) => {
    dispatch({
        type: MOVE_RIGHT,
    });
};