import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AddTipModal = ({ open, handleClose }) => {

  const [showCustomField, setshowCustomField] = useState(false);
  const handleCustomField = () => setshowCustomField(!showCustomField);
  
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className="modal-layout">
        <button
          type="button"
          onClick={handleClose}
          className="btn btn-close-modal"
        >
          <CloseIcon />
        </button>
        <Box className="modal-title">
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add TIP
          </Typography>
        </Box>
        <Box>
          <Grid container className="groups-button">
            <Grid item md={3}>
              <Button variant="outlined" className="btn btn-outline-grey">
                {' '}
                5% 2.5 Rs
              </Button>
            </Grid>
            <Grid item md={3}>
              <Button variant="outlined" className="btn btn-outline-grey">
                {' '}
                10% 5 Rs
              </Button>
            </Grid>
            <Grid item md={3}>
              <Button variant="outlined" className="btn btn-outline-grey">
                {' '}
                15% 7.5 Rs
              </Button>
            </Grid>
            <Grid item md={3}>
              <Button variant="outlined" className="btn btn-outline-grey">
                {' '}
                20% 10 Rs
              </Button>
            </Grid>
            <Grid item md={5}>
              <Button
                variant="outlined"
                onClick={handleCustomField}
                className="btn btn-outline-grey"
              >
                {' '}
                Custom Amount
              </Button>
            </Grid>
            {showCustomField && (
              <Grid item md={12} xs={12}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter custom"
                />
              </Grid>
            )}
          </Grid>
          <Grid container className="add-now-bttn">
            <Grid item md={12}>
              <Button
                variant="outlined"
                onClick={handleClose}
                className="btn btn-outline-grey w-auto"
              >
                Cancel
              </Button>
              <Button variant="contained" className="btn btn-primary w-auto">
                Add Now
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddTipModal;
