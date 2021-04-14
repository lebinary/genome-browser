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

const initialState = {
    title: "chr1",
    headers: [],
    data: [],
    reference: "",
    min: 200000,
    max: 200010,
    error: false,
    errorMessage: "",
    bamFile: null,
    alignments: {},
    isSetting: false,
    settings: {
        checkedReference: true,
        checkedGene: true,
        checkedAlignment: true,
    }
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default function(state = initialState, action) {
    const { type, payload } = action;
    switch(type){
        case ZOOM_IN:
            return {...state, min: state.min +2, max: state.max -2};
        case ZOOM_OUT:
            return {...state, min: state.min>1? state.min -2: state.min, max: state.max<3000000000? state.max +2 : state.max};
        case MOVE_LEFT:
            if(state.min -payload.moveDistance < 1){
                return {...state, min: 1, max: 1+payload.range};
            }else{
                return {...state, min: state.min -payload.moveDistance, max: state.max -payload.moveDistance};
            }
        case MOVE_RIGHT:
            if(state.max +payload.moveDistance > 3000000000){
                return {...state, min: 3000000000 - payload.range, max: 3000000000};
            }else{
                return {...state, min: state.min +payload.moveDistance, max: state.max +payload.moveDistance};
            }
        case SET_RANGE:
            return {...state, min: payload.pos1, max: payload.pos2};
        case GET_HEADERS:
            return {...state, headers: payload.headers};
        case CHANGE_REFERENCE:
            return {...state, title: payload.title, min: payload.min, max: payload.max};
        case GET_DATA:
            let data = [];
            for(let i=0; i <= (state.max - state.min); i++){
                data.push(getRandomInt(0, 65));
            }
            return {...state, data: data, reference: payload.seq};
        case LOAD_BAMFILE:
            return {...state, alignments: payload};
        case ERROR:
            return {...state, error: true, errorMessage: payload.message};
        case CLOSE_ERROR:
            return {...state, error: false, errorMessage: ""};
        case OPEN_SETTING:
            return {...state, isSetting: true};
        case CLOSE_SETTING:
            return {...state, isSetting: false};
        case UPDATE_SETTINGS:
            return {...state, settings: payload};
        default:
            return state;
    }
}