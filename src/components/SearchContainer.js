import React, { useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  Button,
  ButtonGroup,
  makeStyles,
} from '@material-ui/core';
import {changeReference, getDataByKeyword, setRefId} from '../actions/index';
import {StyledTextField} from './customizedComponent';

const SearchContainer = ({changeReference, getDataByKeyword, setRefId, genomeViewer: {serverUrl, min, max, refId, title}}) => {
  const classes = useStyles();
  const [value, setValue] = useState(`${title}:${min} - ${max}`);

  const handleChange = (e) => {
    if(e.target.value != null){
      setValue(e.target.value);
    }
  };

  useEffect(() => {
    setValue(`${title}:${min} - ${max}`)
  }, [title, min, max])

  const search = () => {
    const seperator = value.indexOf(":");
    if(seperator !== -1){
      const title = value.substr(0, seperator).replace(/\s+/g, ' ').trim();
      const range = value.substr(seperator+1).replace(/\s+/g, ' ').trim();
      const result = validateRange(range);
      if(result === null) {
        alert('Invalid range');
      }else{
        const {pos1, pos2} = result;
        changeReference(refId, title, {min: pos1, max: pos2});
      }
    }else{
      getDataByKeyword(serverUrl, value);
    };
  }

  const handleClick = (e) => {
    search();
  }

  const handleKeyPress = (e) => {
    if(e.key === 'Enter'){
      search();
    }
  };

  return(
    <div className={classes.searchContainer} onKeyPress={handleKeyPress}>
        <StyledTextField
          className={classes.input}
          placeholder={`${title}:${min} - ${max}`}
          type="text"
          onChange={handleChange}
          value={value}
        />
        <ButtonGroup style={{marginRight: '10px'}}>
          <Button 
            className={classes.button}  
            variant={refId==='hg38'? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => setRefId('hg38')}>Hg38</Button>
          <Button 
            className={classes.button} 
            variant={refId==='hg19'? 'contained' : 'outlined'} 
            color="primary"
            onClick={() => setRefId('hg19')}>Hg19</Button>
        </ButtonGroup>
        <Button variant="contained" color="primary"
        disabled={value === ''}
        className={classes.button}
        onClick={handleClick}>
            GO
        </Button>
  </div>
  );
};

SearchContainer.propTypes = {
  genomeViewer: PropTypes.object.isRequired,
  changeReference: PropTypes.func.isRequired,
  setRefId: PropTypes.func.isRequired,
  getDataByKeyword: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  genomeViewer: state.genomeViewer,
});

export default React.memo(connect(mapStateToProps, {changeReference, setRefId, getDataByKeyword})(SearchContainer));

//Style
const useStyles = makeStyles((theme) => ({
  searchContainer: {
    width: '100%',
    height: "100%",
    display: "flex",
    justifyContent: 'flex-start'
  },
  input: {
    height: '100%',
    width: '15em',
    fontWeight: "bold",
    color: "#2f2f66",
    marginRight: '10px',
  },
  button: {
    fontSize: "14px",
    textAlign: "center",
    height: "100%",
  },
}));


//Functions
export const validateRange = (range) => {
  const index = range.indexOf("-");
  if(index !== -1) {
      const pos1 = parseInt(range.substr(0, index));
      const pos2 = parseInt(range.substr(index+1));
      if(isNaN(pos1) || isNaN(pos2)){
        return null;
      }
      
      if(((pos2-pos1<10) 
          || pos2 === '' 
          || pos1 === '' 
          || pos2 < 0
          || pos1 < 0)) {
          
          return null;
      }else{
        return {pos1, pos2};
      }
  }else return null;
}