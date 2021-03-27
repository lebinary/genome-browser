import {
    ZOOM_IN,
    ZOOM_OUT,
    SET_VALUE,
    TO_ADDRESS,
    MOVE_LEFT,
    MOVE_RIGHT,
    GET_DATA,
} from '../types';

const initialState = {
    data: [],
    reference: [],
    min: 0,
    max: 10,
    value: 5,
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const letters = ["A", "T", "C", "G"];

export default function(state = initialState, action) {
    const { type, payload } = action;
    switch(type){
        case ZOOM_IN:
            return {...state, min: state.min +2, max: state.max -2};
        case ZOOM_OUT:
            return {...state, min: state.min>0? state.min -2: state.min, max: state.max<3000000000? state.max +2 : state.max};
        case MOVE_LEFT:
            return {...state, min: state.min -10, max: state.max -10};
        case MOVE_RIGHT:
            return {...state, min: state.min +10, max: state.max +10};
        case SET_VALUE:
            return {...state, value: payload};
        case TO_ADDRESS:
            return {...state, min: payload<=5? 0: payload-5, max: parseInt(payload)+5, value: payload};
        case GET_DATA:
            let data = [];
            let reference = [];
            for(let i=0; i <= (state.max - state.min); i++){
                data.push(getRandomInt(0, 65));
                reference.push(letters[parseInt(getRandomInt(0,3))]);
            }
            return {...state, data: data, reference: reference};
        default:
            return state;
    }
}