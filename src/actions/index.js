import {
    ZOOM_IN,
    ZOOM_OUT,
    SET_VALUE,
    SET_RANGE,
    MOVE_LEFT,
    MOVE_RIGHT,
    GET_DATA,
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

export const setRange = (rangeObj) => (dispatch) => {
    dispatch({
        type: SET_RANGE,
        payload: rangeObj,
    });
};

export const moveLeft = (moveRange) => (dispatch) => {
    dispatch({
        type: MOVE_LEFT,
        payload: moveRange
    });
};

export const moveRight = (moveRange) => (dispatch) => {
    dispatch({
        type: MOVE_RIGHT,
        payload: moveRange
    });
};

export const getData = () => (dispatch) => {
    dispatch({
        type: GET_DATA,
    });
};