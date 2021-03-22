import {
    ZOOM_IN,
    ZOOM_OUT,
    SET_VALUE,
    TO_ADDRESS,
} from '../types';

const initialState = {
    min: 0,
    max: 3,
    value: 2,
};

export default function(state = initialState, action) {
    const { type, payload } = action;
    switch(type){
        case ZOOM_IN:
            return {...state, min: state.min +1, max: state.max -1};
        case ZOOM_OUT:
            return {...state, min: state.min>0? state.min -1: state.min, max: state.max<3000000000? state.max +1 : state.max};
        case SET_VALUE:
            return {...state, value: payload};
        case TO_ADDRESS:
            return {...state, min: payload<=5? 0: payload-5, max: parseInt(payload)+5, value: payload};
        default:
            return state;
    }
}