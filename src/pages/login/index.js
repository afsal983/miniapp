import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
// import BrandLogo from './../../assets/images/logo-final.png';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Button, Typography } from '@mui/material';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Keyboard from 'react-simple-keyboard';
import CircularProgress from '@mui/material/CircularProgress';
import axios from '../../http/axios-auth';
import CustomAlert from '../../components/AlertDialog';
import { store } from '../../redux/store';
import { setBranchId, setBranchRefreshToken, setBranchToken, setSelectedBranch } from '../../redux/actions';
import { ROUTES } from '../../App';
import { parse } from 'uuid';

const LoginPage = () => {
  const [inputs, setInputs] = useState({});
  const [layoutName, setLayoutName] = useState("default");
  const [showKeypad, setShowKeypad] = useState(false);
  const [inputName, setInputName] = useState("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const navigate = useNavigate();
  const keyboard = useRef();

  var BrandLogo = 'https://app.smeeye.com/assets/images/smeeye_logo.png'

  const handleChange = () => {
    setShowKeypad(true);
  };
  const handleSubmit = () => {

    const emailValue = getInputValue("email");
    const passwordValue = getInputValue("password");
    if (!emailValue?.trim()) {
      setError({
        open: true,
        title: 'Email Required',
        message: 'Please enter an email'
      });
      return;
    }

    if (!passwordValue?.trim()) {
      setError({
        open: true,
        title: 'Password Required',
        message: 'Please enter password'
      });
      return;
    }

    setLoading(true);
    axios.post(`/auth/signin`, {
      username: emailValue,
      password: passwordValue,
      remember: 0,
    }).then(response => {
      setLoading(false);
      store.dispatch(setBranchRefreshToken(response.data.refresh_token));
      store.dispatch(setBranchToken(response.data.token));
      store.dispatch(setBranchId(response.data.branch_id))
      store.dispatch(setSelectedBranch(response.data.branch_id));
      function parseJwt (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    }
     console.log(parseJwt(response.data.token))    
      // console.log(response.data.token)
      navigate(ROUTES.EMPLOYEE_LOGIN);
    }).catch(error => {
      setLoading(false);
      setError({
        open: true,
        title: 'Server Error',
        message: error?.response?.message || error?.message || ''
      });
    })
  };

  const onChangeAll = inputs => {
    /**
     * Here we spread the inputs into a new object
     * If we modify the same object, react will not trigger a re-render
     */
    setInputs({ ...inputs });
    console.log("Inputs changed", inputs);
  };

  const onChangeInput = event => {
    const inputVal = event.target.value;

    setInputs({
      ...inputs,
      [inputName]: inputVal
    });

    keyboard?.current?.setInput(inputVal);
  };

  const getInputValue = inputName => {
    return inputs[inputName] || "";
  };

  return (
    <Grid container className="registration-screen">
      {/* <Box className="ribbon-art"></Box> */}
      <Grid item xs={12} md={4} className="left-area">
        <Box>
          <img
            src={BrandLogo}
            width={210}
            alt="Salon App"
            loading="lazy"
            className="brand-logo"
          />
        </Box>
      </Grid>
      <Grid item xs={12} md={8} className="right-area">
        <Box
          noValidate
          autoComplete="off"
          component="form"
          className="registration-form"
        >
          <Typography varient="h1" className="heading-title">
            Sign In
          </Typography>
          <Box className="field-group">
            <label>Email</label>
            <input
              type="email"
              onMouseEnter={handleChange}
              value={getInputValue("email")}
              onFocus={() => setInputName("email")}
              onChange={onChangeInput}
              className="form-control"
              placeholder="Enter Email"
            />
          </Box>
          <Box className="field-group">
            <label>Password</label>
            <input
              type="password"
              onMouseEnter={handleChange}
              value={getInputValue("password")}
              onFocus={() => setInputName("password")}
              onChange={onChangeInput}
              className="form-control"
              placeholder="Enter Password"
            />
          </Box>
          <Box className="field-checkbox">
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Remember Me"
                className="rember-me-field"
              />
            </FormGroup>
          </Box>
          <Box className="field-group mt-3">
            <Button
              variant="contained"
              onClick={handleSubmit}
              className="btn btn-primary"
            >
              Enter
            </Button>
          </Box>
        </Box>
        {showKeypad && <Keyboard
          keyboardRef={r => (keyboard.current = r)}
          inputName={inputName}
          layoutName={layoutName}
          onChangeAll={onChangeAll}
        />}
      </Grid>
      {loading ? <Box sx={{ display: 'flex', position: 'absolute', top: 0, bottom: 0, right: 0, left: 0, zIndex: 3, alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box> : null}
      <CustomAlert {...error} close={() => setError({})} />
    </Grid>
  );
};

export default LoginPage;
