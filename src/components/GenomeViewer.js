import React, {useEffect, useState, useCallback, useRef} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {zoomOut, 
    zoomIn,
    moveLeft,
    moveRight,
    getData,
    getDataByKeyword,
    getHeaders, 
    getSNPFields} from '../actions/index';
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';
import Gene from './Gene';
import Reference from './Reference';
import Frequency from './Frequency';
import Spinner from '../utils/Spinner';
import { useParams } from 'react-router-dom';
import { validateRange } from './SearchContainer';

const GenomeViewer = ({getData,
                        zoomIn,
                        zoomOut,
                        moveLeft,
                        moveRight,
                        getDataByKeyword,
                        getHeaders,
                        getSNPFields,
                        genomeViewer:{serverUrl, min, max, title, refId, loading}}) => {
    const classes = useStyles();
    const [isDragging, setDragging] = useState(false);
    const [clientX, setClientX] = useState(null);
    const isFirstRun = useRef(true);
    let {keyword, nameRange, referenceId} = useParams();
    const [scanner, setScanner] = useState({
        open: false,
        x: 0,
    });

    // First render
    useEffect(() => {
        getSNPFields(serverUrl);

        (async() => {
            await getHeaders(serverUrl);
        })();
        
        if(keyword) getDataByKeyword(serverUrl, keyword);
        else if(nameRange && referenceId) {
            const seperator = nameRange.replace('%20', '').indexOf(":");
            const extractedTitle = nameRange.substr(0, seperator).replace(/\s+/g, ' ').trim();
            const range = nameRange.substr(seperator+1).replace(/\s+/g, ' ').trim();
            const result = validateRange(range);
            if(result === null) {
                alert('Invalid range');
                getData(serverUrl, extractedTitle, {min, max}, referenceId);
            }else{
                const {pos1, pos2} = result;
                getData(serverUrl, extractedTitle, {min: pos1, max: pos2}, referenceId);
            }
        }
    }, [getHeaders, getSNPFields]);

    // Not first render
    const bounceGetData = useCallback(
        _.debounce((serverUrl, title, {min, max}, refId) => {
            getData(serverUrl, title, {min, max}, refId);
        }, 500),
        [getData]
    );

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        bounceGetData(serverUrl, title, {min, max}, refId);
    }, [min,max, getData, refId, title, bounceGetData]);

    const handleMouseMove = (e) => {
        const canvas = document.getElementById('reference');
        const container = document.getElementById('container');
        const rect = canvas.getBoundingClientRect();

        if(rect.left < e.clientX && e.clientX < (rect.right - 10)){
            setScanner({
                open: true, 
                x: e.clientX - container.getBoundingClientRect().left + 2,
            });
        }
    };

    const handleWheel = e => {
        const canvas = document.getElementById('reference');
        const rect = canvas.getBoundingClientRect();
        let x;
        if(e.clientX < rect.left){
            x = 0;
        }else if(e.clientX > rect.right){
            x = rect.right - rect.left;
        }else if(e.clientY >= rect.top && e.clientY <= rect.bottom){
            return;
            //Inside Genes
        }else{
            x = e.clientX - rect.left;
        }
        const unitPixel = canvas.clientWidth / (max-min);
        let mousePosition;
        if((max-min) % 2 === 0){
            mousePosition = min + Math.round(x / unitPixel);
        }else{
            mousePosition = min + Math.floor(x / unitPixel);           
        }

        if (e.deltaY < 0) {
            if(max-min>30){
                zoomIn(mousePosition, 1.1);
            }
        } else {
            if(max-min<8000000){
                zoomOut(mousePosition, 1.1);
            }
        }
    }

    const onMouseDown = e => {
        setDragging(true);
        setClientX(e.clientX);
        setTimeout(() => setDragging(false), 2000);
    };
    
    const onMouseUp = () => {
        setDragging(false);
        setClientX(null);
    };
    
    const onMouseMove = e => {
        if (isDragging === true) {
            const range = max - min;
            const canvasWidth = document.getElementById('reference').scrollWidth;
            const unitPixel = canvasWidth / range;

            //move right
            if(e.clientX < clientX && (clientX - e.clientX) > unitPixel ){
                setClientX(e.clientX);
                moveRight(Math.floor((clientX - e.clientX)/unitPixel), range);
            }
            //move left
            else if(e.clientX > clientX && (e.clientX - clientX) > unitPixel){
                setClientX(e.clientX);
                moveLeft(Math.floor((e.clientX - clientX)/unitPixel), range);
            }
        }
    };

    return(
        <div className={classes.root}
            onWheel={handleWheel}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
        >
            <div 
            id={"container"}
            className={classes.container} 
            onMouseMove={handleMouseMove}
            draggable="false">
                <Reference/>
                <Frequency/>
                <Gene/>
                <div className={[classes.scanner, classes.noSelect].join(" ")}
                    style={{left: scanner.x, display: scanner.open? 'block':'none'}}
                />
            </div>
            {loading && <Spinner/>}
        </div>
    );
};

GenomeViewer.propTypes = {
    getData: PropTypes.func.isRequired,
    zoomIn: PropTypes.func.isRequired,
    zoomOut: PropTypes.func.isRequired,
    moveLeft: PropTypes.func.isRequired,
    moveRight: PropTypes.func.isRequired,
    getDataByKeyword: PropTypes.func.isRequired,
    getHeaders: PropTypes.func.isRequired,
    getSNPFields: PropTypes.func.isRequired,
    genomeViewer: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default React.memo(connect(mapStateToProps, 
    {
        getData, 
        getHeaders, 
        getSNPFields, 
        zoomIn, 
        zoomOut, 
        moveLeft, 
        moveRight,
        getDataByKeyword
    })(GenomeViewer));

    
    //Style
const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: "#e5e5e5",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        borderBottom: "1px solid #999FA5",
    },
    container: {
        position: 'relative',
        width: "100%",
        minHeight: '30%',
        backgroundColor: "#fff",
    },
    scanner: {
        zIndex: 1,
        cursor: 'default',
        position: 'absolute',
        top: 0,
        left: '50%',
        height: '100%',
        width: '0.5px',
        backgroundColor: 'rgb(145,44,57, .6)',
    },
}));

function findGrid(file) {
    // 1 KB at a time, because we expect that the column will probably small.
    var CHUNK_SIZE = 1024;
    var offset = 0;
    var reader = new FileReader();
    
    reader.onload = function() {
        // var view = new Uint8Array(reader.result);
        console.log(reader.result);
        // for (var i = 0; i < view.length; ++i) {
        //     if (view[i] === 10 || view[i] === 13) {
        //         // \n = 10 and \r = 13
        //         // column length = offset + position of \r or \n
        //         return;
        //     }
        // }
        // \r or \n not found, continue seeking.
        // offset += CHUNK_SIZE;
        // seek();
    };
    reader.onerror = function() {
        // Cannot read file... Do something, e.g. assume column size = 0.
        alert('error');
    };
    seek();
    
    function seek() {
        if (offset >= file.size) {
            // No \r or \n found. The column size is equal to the full
            // file size
            return;
        }
        var slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsText(slice);
    }
}