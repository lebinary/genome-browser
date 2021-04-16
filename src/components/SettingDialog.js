import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
    DialogActions, 
    DialogTitle,
    DialogContent,
    Dialog, 
    Button, 
    makeStyles,
    FormControlLabel,
    Checkbox,
    IconButton,
} from '@material-ui/core';
import BackupIcon from '@material-ui/icons/Backup';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import 'fontsource-roboto';
import {closeSetting, updateSettings} from '../actions';

const useStyles = makeStyles((theme) => ({
  dialog: {
    width: "30%"
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
  },
  alignmentSetting: {
    display: "flex",
  },
  input: {
    display: 'none'
  },
  fileName: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  }
}));

const SettingDialog = ({closeSetting, updateSettings, genomeViewer:{isSetting}}) => {
    const classes = useStyles();
    const [uploadState, setUploadState] = useState({
      file: null,
      fileName: "",
    });
    const [state, setState] = useState({
        checkedReference: true,
        checkedGene: true,
        checkedAlignment: true,
    });
    
    const handleChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.checked });
        removeFile();
    };

    const updateTrack = () => {
      if(state && uploadState.file !== null){
        updateSettings(state, uploadState.file);
        closeSetting();
      }
    }

    const getFile = (e) => {

      if (!e || !e.target || !e.target.files || e.target.files.length === 0) {
        return;
      }
    
      const file = e.target.files[0];
      const name = e.target.files[0].name;

      console.log(e.target.value)
      setUploadState({file: file, fileName:name})
    }

    const removeFile = (e) => {
      document.getElementById("upload-file").value = null;
      setUploadState({file: null, fileName:""})
    }

    return(
    <Dialog
      open={isSetting}
    >
      <DialogTitle>TRACK SETTINGS</DialogTitle>
      <DialogContent className={classes.dialogContent} dividers>
        <FormControlLabel
            control={
            <Checkbox
                checked={state.checkedReference}
                onChange={handleChange}
                name="checkedReference"
                color="primary"
            />
            }
            label="Reference"
        />
        <FormControlLabel
            control={
            <Checkbox
                checked={state.checkedGene}
                onChange={handleChange}
                name="checkedGene"
                color="primary"
            />
            }
            label="Genes"
        />
        <div className={classes.alignmentSetting}>
          <FormControlLabel
              control={
              <Checkbox
                  checked={state.checkedAlignment}
                  onChange={handleChange}
                  name="checkedAlignment"
                  color="primary"
              />
              }
              label="Alignments"
          />
          <input 
            accept=".txt" 
            disabled={!state.checkedAlignment} 
            className={classes.input} 
            type="file" 
            id="upload-file"
            onChange={getFile}/>
          <label htmlFor="upload-file">
            <IconButton color="primary" style={{display: uploadState.file===null?"block":"none"}} disabled={!state.checkedAlignment} aria-label="upload file" component="span">
              <BackupIcon />
            </IconButton>
          </label>
          <IconButton color="primary" onClick={removeFile} style={{display: uploadState.file===null?"none":"block"}} aria-label="remove file" component="span">
            <HighlightOffIcon />
          </IconButton>
          {setUploadState.file===null? null: <span className={classes.fileName}>{uploadState.fileName}</span>}
        </div>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={closeSetting} color="primary">
          Cancel
        </Button>
        <Button onClick={updateTrack} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
    );
};

SettingDialog.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
    closeSetting: PropTypes.func.isRequired,
    updateSettings: PropTypes.func.isRequired,
};
  
const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default React.memo(connect(mapStateToProps, {closeSetting, updateSettings})(SettingDialog));