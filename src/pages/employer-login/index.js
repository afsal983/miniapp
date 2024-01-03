import React, { useEffect} from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import BrandLogo from './../../assets/images/logo-final.png';
import { Button, IconButton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../http/axios-auth2';
import axios2 from '../../http/axios-auth';
import CustomAlert from '../../components/AlertDialog';
import { setDefaultEmployee, setEmployeeInfo, setEmployeeRefreshToken, setEmployeeToken, setSettings,setSelectedCustomer,setBranchToken,setBranchRefreshToken,setSelectedBranch } from '../../redux/actions';
import { ROUTES } from '../../App';
import { connect } from 'react-redux';
import { Store, store } from '../../redux/store'
import { LoginOutlined } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import Keyboard from "react-simple-keyboard";


const customLayout = {
  default: [
    "q w e r t y u i o p",
    "a s d f g h j k l",
    "{shift} {numbers} z x c v b n m {backspace}",
    "{space}"
  ],
  shift: [
    "Q W E R T Y U I O P",
    "A S D F G H J K L",
    "{shift} {numbers} Z X C V B N M {backspace}",
    "{space}"
  ],
  symbols: [
    "[ ] { } # % ^ * + =",
    "_ \\ | ~ < > € £ ¥ ·",
    "{abc} {numbers} . , ? ! ' {backspace}",
    "{space}"
  ],
  numbers: [
    "1 2 3",
    "4 5 6",
    "7 8 9",
    ". 0 ,",
    "{backspace}"
  ]
};


export function CircularIndeterminate() {
  return (
    <Box sx={{ display: 'flex', position:'fixed', top:0, bottom:0, right: 0, left:0, zIndex:1000, alignItems:'center', justifyContent:'center' }}>
      <CircularProgress  size={20}/>
    </Box>
  );
}


function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
} 

const EmployeeLogin = ({setSettingsAction, branchId, branchRefreshToken, setEmployeeTokenAction, setEmployeeInfoAction, setEmployeeRefreshTokenAction, setSelectedEmployeeAction,setSelectedBranchAction}) => {
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showKeypad, setShowKeypad] = useState(false);
  const [originalPin, setOriginalPin] = useState('');
  const [pin, setPin] = useState('');
  const navigate = useNavigate();
  const keyboardRef = useRef(null);
  const [error, setError] = useState({});
  const [loading, setLoader] = useState(false);
  const [layoutName, setLayoutName] = React.useState("numbers");


  useEffect(() => {
    if(branchId) {
      loadEmployeeList();
    }
  }, [branchId])

  const loadEmployeeList = () => {
    axios.get(`/employees/?branch_id=${branchId}`).then(response => {
    
      setEmployeeList(response?.data?.data || []);
    }).catch(error => {
      setError({
        open: true,
        title: 'Server Error',
        message: error?.response?.message || error?.message
      });
    })
  }

  const onSubmit = async (event) => { 
    await delay(1000);
    if (pin?.trim().length > 3) {
      if(pin === originalPin) return;
      setLoader(true);
      axios2.post(`/auth/pinsignin`, {
        username: selectedEmployee.email,
        pin: pin,
        refreshtoken: branchRefreshToken
      }).then( async (response) => {
        try {
          const settingsResponse = await axios.get('/settings');
          const settings = settingsResponse.data.data;
          settings.map((item)=>{
            if(item.name === 'walkin'){
                store.dispatch(setSelectedCustomer({id:JSON.parse(item.value),firstname:item.name,lastname:'',telephone:'+97100000000'}))
            }
          })
        setSettingsAction(settings);
        setSelectedEmployeeAction(selectedEmployee.id);
        setEmployeeInfoAction(response.data);
        setEmployeeTokenAction(response.data.token);
        setEmployeeRefreshTokenAction(response.data.refresh_token)
        setSelectedBranchAction(response.data.branch_id)
        setLoader(false);
        navigate(ROUTES.CART);
        } catch(error) {
          setLoader(false);
           console.log(error)
        }
      }).catch(error => {
        setLoader(false);
        if(error.response.status=== 417) {
          setOriginalPin(pin);
        }
        setError({
          open: true,
          title: 'Authentication Error',
          message: error?.response?.data?.message || error?.message
        });
      })
    }
  }

  const input = useRef(null);

  const handleOnKeyPress = (button) => {
    if (button === "{backspace}") {
      setPin(pin.slice(0, -1));
    }
  };

  const handleClick = (e) => {
    // e.persist();
      input.current.focus()
  }; 

  const Logout = () =>{
    store.dispatch(setBranchRefreshToken([]));
    store.dispatch(setBranchToken([]));
    navigate(ROUTES.HOME)
  }

  return (
    <Grid container className="registration-screen">
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
       {/* <Grid item xs={12} direction="row"
          alignItems="flex-end"
          justifyContent="flex-end" >
       <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            style={{paddingRight:'48%',color:'black'}}
            // onClick={() => logout()}
          >
            <LoginOutlined/>
          </IconButton>
       </Grid> */}
        <Box
          noValidate
          autoComplete="off"
          component="form"
          className="registration-form"
        >
        <Grid  container
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
          rowSpacing={1}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={10}>
          <Typography varient="h1" className="heading-title">
            EMPLOYEE LOGIN
          </Typography>
          </Grid>
          <Grid item xs={2}>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={() => Logout()}
          >
            <LoginOutlined/>
          </IconButton>
          </Grid>
        </Grid>
          <Stack direction="row" spacing={1}>
            <Grid container className="multi-login-chips" style={{height:'15rem',overflowY: 'scroll',marginTop:'60px'}}>
              {employeeList.map(item => <Grid item xs={6} md={4} className={selectedEmployee?.id === item.id ? "selected-user-card user-card" : "user-card"} key={item.id}>
                <Button 
                onClick={() => {setSelectedEmployee(item)}}
                onKeyDown={()=>handleClick()}
                onMouseEnter={()=>handleClick()}
                >
                  
                  {item.id} <br /> {item.name}
                </Button>
              </Grid>)}
            </Grid>
          </Stack>
          <Box className="field-group">
            <label>PIN</label>
            <input
              type="password"
              disabled={!selectedEmployee}
              ref={input}
              value={pin}
              maxLength={4}
              onChange={(event)=> {
                if(event.target.value === '') {
                  setOriginalPin('');
                }
                setPin(event.target.value)}}
              onKeyUp={() => onSubmit()}
              onFocus={() => {
                setShowKeypad(true)}}
              className="form-control"
              placeholder="Enter PIN"
            />
          </Box>
        </Box>
       {showKeypad ?<Keyboard 
        keyboardRef={r => keyboardRef.current = r}
        maxLength={4}
        inputName="default"
        inputs={{default: pin}}
        onChange={(event) =>{setPin(event); if(pin === '') {
          setOriginalPin('')
        }}} 
        onKeyPress={handleOnKeyPress}
        layoutName={layoutName}
        layout={customLayout}
        onKeyReleased={() => onSubmit()}
        />: null}
      </Grid>
      <CustomAlert {...error} close={() => setError({})} />
      {loading ? <CircularIndeterminate/>: null}
    </Grid>
  );
};

const mapStateToProps = state => ({
  branchId: state.base.branchId,
  branchRefreshToken:  state.base.branchRefreshToken,
});
const mapDispatchToProps = dispatch => ({
    setEmployeeTokenAction: (data) => dispatch(setEmployeeToken(data)),
    setEmployeeRefreshTokenAction: (data) => dispatch(setEmployeeRefreshToken(data)),
    setEmployeeInfoAction: (data) => dispatch(setEmployeeInfo(data)),
    setSelectedEmployeeAction: (data) => dispatch(setDefaultEmployee(data)),
    setSettingsAction: (data) => dispatch(setSettings(data)),
    setSelectedBranchAction:(data)=> dispatch(setSelectedBranch(data)) 
});
export default connect(mapStateToProps, mapDispatchToProps)(EmployeeLogin);

