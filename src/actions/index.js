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
    LOAD_BAMFILE,
    OPEN_SETTING,
    CLOSE_SETTING,
    UPDATE_SETTINGS,
} from '../types';
import axios from 'axios';
import {BamFile} from '@gmod/bam';


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

export const openSetting = () => (dispatch) => {
    dispatch({
        type: OPEN_SETTING,
    });
};

export const closeSetting = () => (dispatch) => {
    dispatch({
        type: CLOSE_SETTING,
    });
};

export const updateSettings = (settingsObj) => (dispatch) => {
    dispatch({
        type: UPDATE_SETTINGS,
        payload: settingsObj,
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

export const loadBamFile = (title, min, max, bamFile) => async (dispatch) => {
    const t = new BamFile({
        bamPath: `${bamFile}`,
    });

    let header = await t.getHeader();
    let records = await t.getRecordsForRange(`${title}`, min, max);

    try {
        dispatch({
            type: LOAD_BAMFILE,
            payload: records
        });
    }catch(err) {
        dispatch({
            type: ERROR,
            payload: err,
        });
    }
};