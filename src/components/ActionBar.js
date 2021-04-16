import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  InputBase, 
  Paper, 
  Button, 
  makeStyles,
  FormControl,
  TextField,
  ListSubheader,
  IconButton,
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import {setRange, changeReference, getHeaders, openSetting} from '../actions';
import mainLogo from '../img/vin_logo.png';
import {Autocomplete} from '@material-ui/lab';
import ListboxComponent from '../utils/ListboxComponent';
import SettingDialog from './SettingDialog';

const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "10px 0",
      borderBottom: "1px solid #999FA5",
      boxSizing: "border-box",
      height: '10vh',
    },
    container: {
      width: "95%",
      height: "100%",
      display: 'flex',
      backgroundColor: "#fff",
      justifyContent: "space-between",
    },
    searchArea: {
      display: 'flex',
      alignItems: 'stretch',
      height: "90%",
    },
    searchContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    paper: {
      margin: '0 10px',
      display: 'flex',
      alignItems: 'center',
      width: 200,
      color: "#19416D"
    },
    input: {
      fontSize: "14px",
      marginLeft: "1em",
      flex: 1,
    },
    button: {
      fontSize: "14px",
      textAlign: "center",
      backgroundColor: "#19416D",
    },

    titleContainer: {
      display: "flex",
      flexDirection: "column",
      width: "15%",
    },
    titleArea: {
      display: 'flex',
      alignItems: 'stretch',
      height: "100%",
    },
    logo: {
      display: "block",
      height: "100%"
    },
    title: {
      textAlign: "center",
      fontSize: "14px",
      color: "#2f2f66",
      fontWeight: "bold",
    },
    editTitle: {
      height: "100%",
      fontWeight: "bold",
      color: "#2f2f66",
    }
}));

const renderGroup = (params) => [
  <ListSubheader key={params.key} component="div">
    {params.group}
  </ListSubheader>,
  params.children,
];

const ActionBar = ({getHeaders, changeReference, setRange, openSetting, genomeViewer: {min, max, headers, title}}) => {
  const classes = useStyles();
  const [pos1, setPos1] = useState('');
  const [pos2, setPos2] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newRef, setNewRef] = useState(title);
  const editTitleRef = useRef(null);

  const handleNewReference = (e) => {
    setNewRef(e.target.textContent);
  };

  const handleEditMode = () => {
    setEditMode(true);
  };

  const changeRef = (e) => {
    if(newRef !== '' && e.key === 'Enter'){
      setEditMode(false);
      setPos1('');
      setPos2('');
      if (pos1 !== '' && pos2 !== ''){
        changeReference(newRef, {min:parseInt(pos1), max:parseInt(pos2)});
      }else{
        changeReference(newRef, {min:1, max:11});
      }
    }
  };

  const handleChangeFrom = (e) => {
    if(e.target.value != null){
      setPos1(e.target.value);
    }
  };

  const handleChangeTo = (e) => {
    if(e.target.value != null){
      setPos2(e.target.value);
    }
  };

  const handleClick = (e) => {
    setPos1('');
    setPos2('');
    if(newRef !== ''){
      changeReference(newRef, {min:parseInt(pos1), max:parseInt(pos2)});
    }else{
      setRange({pos1: parseInt(pos1), pos2: parseInt(pos2)});
    }
  }

  const handleClickOutside = (e) => {
    if (editTitleRef.current && !editTitleRef.current.contains(e.target)) {
      if(e.target.value === undefined){
        setNewRef(title);
        setEditMode(false);
      }
    }
  };

  useEffect(() => {
    getHeaders();
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, [getHeaders]);

  return(
    <div className={classes.root}>
    <div className={classes.container} onKeyPress={changeRef}>
      <div className={classes.titleArea}>
        <div className={classes.titleArea}>
          <img src={mainLogo} className={classes.logo} alt="vinbigdata"/>
          <Button onDoubleClick={handleEditMode} style={{display: editMode? 'none': 'block'}} className={classes.title}>{title}</Button>
          <FormControl style={{display: editMode? 'block': 'none'}}>
            <Autocomplete
              ref={editTitleRef}
              onChange={handleNewReference}
              value={newRef}
              style={{width: 200}}
              ListboxComponent={ListboxComponent}
              renderGroup={renderGroup}
              options={headers}
              groupBy={(option) => option[0].toUpperCase()}
              renderInput={(params) => <TextField value={newRef} className={classes.editTitle} {...params}/>}
              renderOption={(option) => <p onClick={(e)=> console.log(e)}>{option}</p>}
            />
          </FormControl>
        </div>
        <div className={classes.searchContainer}>
          <div className={classes.searchArea}>
            <Paper component="form" className={classes.paper}>
              <InputBase
                className={classes.input}
                placeholder={min.toString()}
                type="number"
                onChange={handleChangeFrom}
                value={pos1}
              />
              
              :

              <InputBase
                className={classes.input}
                placeholder={max.toString()}
                type="number"
                onChange={handleChangeTo}
                value={pos2}
              />
            </Paper>
            <Button variant="contained" color="primary" 
            disabled={((pos2-pos1<10) || pos2 === '' || (pos1 === '' && pos1 > 0))}
            className={classes.button} 
            onClick={handleClick}>
              GO
            </Button>
          </div>
        </div>
      </div>
      <div>
        <IconButton onClick={openSetting} color="primary">
          <SettingsIcon />
        </IconButton>
      </div>
      <SettingDialog/>
    </div>
    </div>
  );
};

ActionBar.propTypes = {
  genomeViewer: PropTypes.object.isRequired,
  setRange: PropTypes.func.isRequired,
  changeReference: PropTypes.func.isRequired,
  getHeaders: PropTypes.func.isRequired,
  openSetting: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  genomeViewer: state.genomeViewer
});

export default React.memo(connect(mapStateToProps, {openSetting, getHeaders, changeReference, setRange})(ActionBar));
