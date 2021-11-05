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
import axios from 'axios';

const CancelToken = axios.CancelToken;
let cancel;

export const zoomIn = (mousePosition, zoomScale) => (dispatch) => {
    dispatch({
        type: ZOOM_IN,
        payload: {mousePosition, zoomScale},
    });
};
  
export const zoomOut = (mousePosition, zoomScale) => (dispatch) => {
    dispatch({
        type: ZOOM_OUT,
        payload: {mousePosition, zoomScale},
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

export const setPivot = (pivot) => (dispatch) => {
    dispatch({
        type: SET_PIVOT,
        payload: pivot    
    });
};

export const setRefId = (refId) => (dispatch) => {
    dispatch({
        type: SET_REF,
        payload: refId
    });
};

export const getData = (serverUrl, title, rangeObj, refId=null) => async (dispatch) => {
    try {
        cancel && cancel();
        const {min, max} = rangeObj;
        let processedRef = [];
        let requestUrl = `${serverUrl}/api?region=${title}:${min}-${max+1}`;
        if(refId !== null) requestUrl += `&ref=${refId}`;
        const res = await axios.get(requestUrl, {cancelToken: new CancelToken(function executor(c) {cancel = c})});
        const {ref_id, header, interval, size, gencode, snp} = res.data;

        if(interval <= 1) {
            processedRef = res.data.ref.split("").map(item => [[item, 1]]);
        }else{
            const refData = res.data.ref[0];
            refData.forEach(arr => {
                const item = []
                arr.forEach((count, index) => {
                    if(count > 0){
                        let dna = "";
                        if(index === 0) dna = "A";
                        else if(index === 1) dna = "T";
                        else if(index === 2) dna = "G";
                        else if(index === 3) dna = "C";
                        else dna = "N";
                        item.push([dna, count/interval])
                    }
                })
                processedRef.push(item);
            })
        }
        dispatch({
            type: GET_DATA,
            payload: {
                refId: ref_id,
                header: header,
                min: min,
                max: max,
                reference: processedRef,
                interval: interval,
                frequencies: snp,
                size: size,
                gene_data: gencode.data, 
                gene_type: gencode.type,},
        });
    }catch(err) {
        if(axios.isCancel(err)){
            console.log('Request canceled');
        }else{
            console.log(err);
        }
    }
};

export const getDataByKeyword = (serverUrl, keyword, refId=null) => async (dispatch) => {
    try {
        let processedRef = [];
        let requestUrl = `${serverUrl}/api?keyword=${keyword}`;
        if(refId !== null) requestUrl += `&ref=${refId}`;
        const res = await axios.get(`${serverUrl}/api?keyword=${keyword}`);
        
        if(res.data){
            const {ref_id, header, interval, size, gencode, snp, pos, highlight} = res.data;
    
            if(interval <= 1) {
                processedRef = res.data.ref.split("").map(item => [[item, 1]]);
            }else{
                const refData = res.data.ref[0];
                refData.forEach(arr => {
                    const item = [];
                    arr.forEach((count, index) => {
                        if(count !== 0){
                            let dna = "";
                            if(index === 0) dna = "A";
                            else if(index === 1) dna = "T";
                            else if(index === 2) dna = "G";
                            else if(index === 3) dna = "C";
                            else dna = "N";
                            item.push([dna, count/interval])
                        }
                    })
                    processedRef.push(item);
                })
            }
            dispatch({
                type: GET_DATA_BY_KW,
                payload: {
                    refId: ref_id,
                    keyword: keyword,
                    reference: processedRef,
                    header: header,
                    interval: interval,
                    frequencies: snp,
                    size: size,
                    highlight: highlight,
                    pos: pos,
                    gene_data: gencode.data, 
                    gene_type: gencode.type,},
            });
        }
    }catch(err) {
        if(axios.isCancel(err)){
            console.log('Request canceled');
        }else{
            console.log(err)
        }
    }
};

export const changeReference = (referenceId, title, rangeObj) => async (dispatch) => {
    const {min, max} = rangeObj;

    dispatch({
        type: CHANGE_REFERENCE,
        payload: {referenceId, title, min, max},
    });
};

export const getHeaders = (serverUrl) => async (dispatch) => {
    try {
        const res = await axios.get(`${serverUrl}/api?headers`);

        const headers = [];
        const headerMax = [];
        res.data.headers.forEach(item => {
            headers.push(item[0]);
            headerMax.push(item[1]);
        });
        dispatch({
            type: GET_HEADERS,
            payload: {headers, headerMax},
        });
        return headers;
    }catch(err) {
        console.log(err);
    }
};

export const getSNPFields = (serverUrl) => async (dispatch) => {
    try {
        const res = await axios.get(`${serverUrl}/api?dbSNFP_fields`);
        dispatch({
            type: GET_SNPFIELDS,
            payload: res.data,
        });
    }catch(err) {
        console.log(err)
    }
};

export const setFilter = (newChecked) => (dispatch) => {
    try {
        dispatch({
            type: SET_FILTER,
            payload: newChecked,
        });
    }catch(err) {
        console.log(err);
    }
};