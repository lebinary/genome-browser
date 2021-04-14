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
    Checkbox
} from '@material-ui/core';
import 'fontsource-roboto';
import {closeSetting, updateSettings} from '../actions';

const useStyles = makeStyles((theme) => ({

}));

const SettingDialog = ({closeSetting, updateSettings, genomeViewer:{isSetting}}) => {
    const [state, setState] = useState({
        checkedReference: true,
        checkedGene: true,
        checkedAlignment: true,
    });
    
    const handleChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.checked });
    };

    const updateTrack = () => {
      if(state){
        updateSettings(state);
        closeSetting();
      }
    }

    return(
    <Dialog
      open={isSetting}
    >
      <DialogTitle>TRACK SETTINGS</DialogTitle>
      <DialogContent dividers>
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