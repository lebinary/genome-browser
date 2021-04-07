import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  InputBase, 
  Paper, 
  Button, 
  makeStyles,
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  FormControl,
  TextField,
  ListSubheader,
} from '@material-ui/core';
import {setRange, getData, getHeaders} from '../actions';
import mainLogo from '../img/vin_logo.png';
import {Autocomplete} from '@material-ui/lab';
import ListboxComponent from '../utils/ListboxComponent';

const useStyles = makeStyles((theme) => ({
    root: {
      padding: '10px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: "#E5E5E5",
      height: "10%",
    },
    searchArea: {
      display: 'flex',
      alignItems: 'stretch',
      padding: "0 0.5em",
    },
    paper: {
      margin: '0 10px',
      display: 'flex',
      alignItems: 'center',
      width: 200,
      color: "#19416D"
    },
    range: {
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      fontSize: "14px",
      marginLeft: "1em",
      flex: 1,
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    button: {
      fontSize: "14px",
      textAlign: "center",
      backgroundColor: "#19416D",
    },
    titleArea: {
      width: "26%",
      height: "100%",
      position: "relative",
      display: 'flex',
      alignItems: 'stretch',
    },
    logo: {
      display: "block",
      width: "15%"
    },
    title: {
      position: "absolute",
      left: "15%",
      height: "100%",
      fontSize: "19px",
      fontWeight: "bold",
    }
}));

const renderGroup = (params) => [
  <ListSubheader key={params.key} component="div">
    {params.group}
  </ListSubheader>,
  params.children,
];

const ActionBar = ({getData, getHeaders, setRange, genomeViewer: {min, max, headers, title}}) => {
  const classes = useStyles();
  const [pos1, setPos1] = useState('');
  const [pos2, setPos2] = useState('');
  const [open, setOpen] = useState(false);
  const [newRef, setNewRef] = useState('');

  const handleNewReference = (e) => {
    setNewRef(e.target.textContent);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const changeReference = () => {
    setOpen(false);
    getData(newRef, {min, max});
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
    setRange({pos1: parseInt(pos1), pos2: parseInt(pos2)});
    setPos1('');
    setPos2('');
  }

  useEffect(() => {
    getHeaders();
    getData(title, {min, max});
  }, []);

  return(
    <div className={classes.root}>
      <div className={classes.titleArea}>
        <img src={mainLogo} className={classes.logo} alt="vinbigdata"/>
        <Button onClick={handleClickOpen} className={classes.title}>{title}</Button>
        <Dialog disableBackdropClick disableEscapeKeyDown open={open} onClose={handleClose}>
        <DialogTitle>CHOOSE REFERENCE</DialogTitle>
        <DialogContent>
          <FormControl className={classes.formControl}>
            <Autocomplete
              onChange={handleNewReference}
              value={newRef}
              style={{ width: 300 }}
              disableListWrap
              ListboxComponent={ListboxComponent}
              renderGroup={renderGroup}
              options={headers}
              groupBy={(option) => option[0].toUpperCase()}
              renderInput={(params) => <TextField {...params} variant="outlined" label="Reference" />}
              renderOption={(option) => <p>{option}</p>}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={changeReference} color="primary">
            Change
          </Button>
        </DialogActions>
      </Dialog>
      </div>
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
            disableListWrap
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
  );
};

ActionBar.propTypes = {
  setRange: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {getData, getHeaders, setRange})(ActionBar);
