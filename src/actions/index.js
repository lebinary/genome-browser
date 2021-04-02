import {
    ZOOM_IN,
    ZOOM_OUT,
    SET_RANGE,
    MOVE_LEFT,
    MOVE_RIGHT,
    GET_DATA,
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

export const getData = (rangeObj) => async (dispatch) => {
    const {min, max} = rangeObj;

    try {
        const res = await axios.get(`http://${window.location.hostname}:8000/api?region=chr1:${min}-${max+1}`);
        dispatch({
            type: GET_DATA,
            payload: res.data,
        });
    }catch(err) {
        console.log(err);
    }
};