import {
    ZOOM_IN,
    ZOOM_OUT,
    SET_RANGE,
    MOVE_LEFT,
    MOVE_RIGHT,
    GET_DATA,
    GET_HEADERS,
    ERROR,
    CLOSE_ERROR,
    CHANGE_REFERENCE,
} from '../types';
import axios from 'axios';


export const zoomIn = () => (dispatch) => {
    dispatch({
        type: ZOOM_IN,
    });
};
  
export const zoomOut = () => (dispatch) => {
    dispatch({
        type: ZOOM_OUT,
    });
};

export const setRange = (rangeObj) => (dispatch) => {
    dispatch({
        type: SET_RANGE,
        payload: rangeObj,
    });
};

export const moveLeft = (moveDistance, range) => (dispatch) => {
    dispatch({
        type: MOVE_LEFT,
        payload: {moveDistance, range}
    });
};

export const moveRight = (moveDistance, range) => (dispatch) => {
    dispatch({
        type: MOVE_RIGHT,
        payload: {moveDistance, range}
    });
};

export const closeError = () => (dispatch) => {
    dispatch({
        type: CLOSE_ERROR,
    });
};

export const getData = (title, rangeObj) => async (dispatch) => {
    const {min, max} = rangeObj;

    try {
        const res = await axios.get(`http://${window.location.hostname}:8000/api?region=${title}:${min}-${max+1}`);
        dispatch({
            type: GET_DATA,
            payload: {...res.data},
        });
    }catch(err) {
        dispatch({
            type: ERROR,
            payload: err,
        });
    }
};

export const changeReference = (title, rangeObj) => async (dispatch) => {
    const {min, max} = rangeObj;

    dispatch({
        type: CHANGE_REFERENCE,
        payload: {title, min, max},
    });
};

export const getHeaders = () => async (dispatch) => {

    try {
        const res = await axios.get(`http://${window.location.hostname}:8000/api?headers`);
        dispatch({
            type: GET_HEADERS,
            payload: res.data,
        });
    }catch(err) {
        dispatch({
            type: ERROR,
            payload: err,
        });
    }
};