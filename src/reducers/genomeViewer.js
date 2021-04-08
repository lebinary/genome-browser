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
            return {...state, min: state.min -payload, max: state.max -payload};
        case MOVE_RIGHT:
            return {...state, min: state.min +payload, max: state.max +payload};
        case SET_RANGE:
            return {...state, min: payload.pos1, max: payload.pos2};
        case GET_HEADERS:
            return {...state, headers: payload.headers};
        case GET_DATA:
            let data = [];
            // let reference = [];
            for(let i=0; i <= (state.max - state.min); i++){
                data.push(getRandomInt(0, 65));
                // reference.push(letters[parseInt(getRandomInt(0,3))]);
            }
            return {...state, data: data, reference: payload.seq, title: payload.header};
        case ERROR:
            return {...state, error: true, errorMessage: payload.message};
        case CLOSE_ERROR:
            return {...state, error: false, errorMessage: ""};
        default:
            return state;
    }
}