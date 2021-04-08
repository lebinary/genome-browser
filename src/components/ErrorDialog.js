import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button} from '@material-ui/core';
import {closeError} from '../actions';

const ErrorDialog = ({closeError, genomeViewer:{error, errorMessage}}) => {
  return (
    <div>
      <Dialog
        open={error}
        onClose={closeError}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>{"Something went wrong"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeError} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


ErrorDialog.propTypes = {
    genomeViewer: PropTypes.object.isRequired,
    closeError: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    genomeViewer: state.genomeViewer
});

export default connect(mapStateToProps, {closeError})(ErrorDialog);