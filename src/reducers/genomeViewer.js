import {
    ZOOM_IN,
    ZOOM_OUT,
    MOVE_LEFT,
    MOVE_RIGHT,
    GET_DATA,
    GET_HEADERS,
    GET_SNPFIELDS,
    CHANGE_REFERENCE,
    GET_DATA_BY_KW,
    SET_PIVOT,
    SET_REF,
    SET_FILTER,
} from '../types';

export const initialState = {
    serverUrl: 'http://3.143.149.107:8000',
    title: "chr1",
    refId: 'hg38',
    upperBoundary: 3000000000,
    headers: [],
    headerMax: [],
    prevRefence: [],
    reference: [],
    interval: 1,
    size: 0,
    pivot: 0,
    currentKeyword: null,
    highlight: [],
    prevMin: 1286871,
    min: 1287122,
    max: 1287192,
    genes: null,
    genesType: null,
    snpFields: null,
    currentAction: "",
    loading: false,
    frequencies: null,
    checked: ['0','1','2','3','4','5','6','7','8','9','10','11'],
};

let leftRange;
let rightRange;
let newMin;
let newMax;
export default function(state = initialState, action) {
    const { type, payload } = action;
    switch(type){
        case ZOOM_IN:
            newMin = payload.mousePosition - Math.round((payload.mousePosition - state.min)/payload.zoomScale);
            newMax = payload.mousePosition + Math.round((state.max - payload.mousePosition)/payload.zoomScale);
            return {...state,
                    currentAction: 'zoomIn', 
                    pivot: payload.mousePosition,
                    min: newMin, 
                    max: newMax,
                    loading: true};
        case ZOOM_OUT:
            leftRange = Math.round((payload.mousePosition - state.min)*payload.zoomScale);
            rightRange = Math.round((state.max - payload.mousePosition)*payload.zoomScale);
            newMin = (payload.mousePosition - leftRange)>1? (payload.mousePosition - leftRange) : 1;
            newMax =  (payload.mousePosition + rightRange)<state.upperBoundary? (payload.mousePosition + rightRange) : state.upperBoundary;
            return {...state,
                    currentAction: 'zoomOut', 
                    pivot: payload.mousePosition,
                    min: newMin, 
                    max:  newMax, 
                    loading: true};
        case SET_PIVOT:
            return {...state, pivot: payload};
        case SET_FILTER:
            return {...state, checked: payload};
        case MOVE_LEFT:
            if(state.min -payload.moveDistance < 1){
                return {...state, 
                    currentAction: 'moveLeft', 
                    min: 1, 
                    max: 1+ payload.range,
                    loading: true};
            }else{
                const slicedRef = state.prevRefence.slice(0, - Math.round(payload.moveDistance/state.interval));
                return {...state,
                    currentAction: 'moveLeft', 
                    prevRefence: slicedRef.length===0? state.prevRefence : slicedRef,
                    min: state.min -payload.moveDistance, 
                    max: state.max -payload.moveDistance,
                    loading: true};
            }
        case MOVE_RIGHT:
            if(state.max +payload.moveDistance > state.upperBoundary){
                newMin = state.upperBoundary - payload.range;
                newMax = state.upperBoundary;
                return {...state, 
                    currentAction: 'moveRight',
                    min: newMin,
                    max: newMax,
                    loading: true};
            }else{
                return {...state,
                    currentAction: 'moveRight',
                    prevRefence: state.prevRefence.slice(Math.round(payload.moveDistance/state.interval)),
                    min: state.min +payload.moveDistance, 
                    max: state.max +payload.moveDistance,
                    loading: true};
            }
        case SET_REF:
            return {...state, 
                refId: payload,
                loading: true,
            };
        case GET_HEADERS:
            return {...state, headers: payload.headers, headerMax: payload.headerMax};
        case GET_SNPFIELDS:
            return {...state, snpFields: payload.dbSNFP_fields};
        case CHANGE_REFERENCE:
            const upperBoundary = parseInt(state.headerMax[state.headers.indexOf(payload.title)]);
            newMin = payload.max > upperBoundary? upperBoundary-(payload.max- payload.min): payload.min;
            newMax = payload.max > upperBoundary? upperBoundary : payload.max;
            return {...state, 
                refId: payload.referenceId,
                title: payload.title,
                upperBoundary: upperBoundary,
                min: newMin, 
                max: newMax}
        case GET_DATA:
            return {...state,
                refId: payload.refId,
                title: payload.header,
                prevRefence: payload.reference,
                prevMin: state.min,
                min: payload.min,
                max: payload.max,
                reference: payload.reference, 
                interval: payload.interval,
                frequencies: payload.frequencies,
                size: payload.size,
                genes: payload.gene_data, 
                genesType: payload.gene_type,
                loading: false,
            };
        case GET_DATA_BY_KW:
            return {...state,
                refId: payload.refId,
                currentKeyword: payload.keyword,
                prevRefence: payload.reference,
                title: payload.header,
                prevMin: parseInt(payload.highlight[0]) - 15,
                min: parseInt(payload.highlight[0]) - 15,
                max: parseInt(payload.highlight[1]) + 15,
                reference: payload.reference, 
                interval: payload.interval,
                frequencies: payload.frequencies,
                size: payload.size,
                genes: payload.gene_data, 
                genesType: payload.gene_type,
                highlight: payload.highlight,
                loading: false};
        default:
            return state;
    }
}