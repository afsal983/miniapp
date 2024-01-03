import React, { useState, useRef,useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from '../../http/axios-auth3';
import { useNavigate } from 'react-router-dom';
import ArrowLeft from '@mui/icons-material/ChevronLeft';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Keyboard from 'react-simple-keyboard';
import { connect } from 'react-redux';
import { ROUTES } from '../../App';
import { setSelectedCustomer } from '../../redux/actions';

const SearchCustomer = ({ setSelectedCustomerAction }) => {
    const [customer, setCustomer] = useState([]);
    const [inputs, setInputs] = useState("searchInput");
    const [layoutName, setLayoutName] = useState("default");
    const [showKeypad, setShowKeypad] = useState(false);
    const [inputName, setInputName] = useState("default");
    const keyboard = useRef();
    const navigate = useNavigate()

    // const {searchInput} = input;
    // useEffect(() => {
    //   keyboard.current.setInput(inputs);
    // }, [inputs]);
    const searchCustomer = (event) => {
        var payload;
        // var matches;
        console.log(event)
        // if(event?.target.value){
        //    matches = event.target.value.match(/\d+/g) 
        // }else{
        //     matches = event.match(/\d+/g) 
        // }
        var matches = event.match(/\d+/g)
        if (matches != null) {
            // alert('number');
            // alert(event.target.value)
            payload = {
                searchbyphone: event,
                row: 0,
                rowperpage: 100
            }
        }else{
            payload = {
                searchbyname: event,
                row: 0,
                rowperpage: 100
            }
        }
       
        axios.post(`/customers`, payload).then(response => {
            // console.log(JSON.stringify(response.data.data) + 'customer')
            setCustomer(response?.data?.data || [])
        }).catch(error => {
            alert(error?.response?.message ||  error?.message)
        });
    }

    const handleChange = () => {
        setShowKeypad(true);
    };


    const onChangeAll = inputs => {
        /**
         * Here we spread the inputs into a new object
         * If we modify the same object, react will not trigger a re-render
         */
        var val = inputs.searchInput
        setInputs({...inputs});
        console.log("Inputs changed", inputs);
        searchCustomer(val);
        console.log(inputs.searchInput);
    };

    const onChangeInput = event => {
        const inputVal = event;

        setInputs({
            ...inputs,
            [inputName]: inputVal
        });

        keyboard?.current?.setInput(inputVal);
    };

    const getInputValue = inputName => {
        return inputs[inputName] || "";
    };

    const pickSelectedCustomer = (item) => {
        setSelectedCustomerAction(item);
        navigate(ROUTES.CART);
    }
    return (
        <Grid container>
            <AppBar position="static" sx={{ background: '#fda302' }}>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={() => navigate('/cart')}
                    >
                        <ArrowLeft />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Search Customer
                    </Typography>
                   <IconButton
                        size="large"
                        edge="end"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={() => navigate('/add-customer')}
                    >
                            <Typography>
                        Add Customer
                    </Typography>
                        <AddIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Grid container sx={{flex:1}}>
            <Grid item xs={12} >
                <Box sx={{ padding: '16px', flex: 0.7 }}>
                    <Box>
                        <Grid className="search-bar">
                            <input
                                type="text"
                                id='searchInput'
                                name='searchInput'
                                placeholder="Search customer name"
                                onMouseEnter={handleChange}
                                value={getInputValue("searchInput")}
                                onFocus={() => setInputName("searchInput")}
                                onChange={(text) => {
                                    // console.log(text)
                                    onChangeInput(text.target.value);
                                    searchCustomer(text.target.value);
                                }
                                }
                            />
                        </Grid>
                    </Box>
                    <Box sx={{maxHeight:'150px',overflowY:'scroll'}}>
                        {customer.map(item => <Typography id="modal-modal-list" sx={{ mt: 2 }} onClick={() => { pickSelectedCustomer(item); }}>
                            {item.firstname} {item.lastname} ({item.telephone})
                        </Typography>)}

                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12} sx={{ flex: 0.3 }}>
                <Box>
                    {showKeypad && <Keyboard
                        keyboardRef={r => (keyboard.current = r)}
                        inputName={inputName}
                        layoutName={layoutName}
                        // onKeyReleased={onChangeAll}
                        onChangeAll={onChangeAll}
                    />}
                </Box>
            </Grid>
            </Grid>
        </Grid>
    );
};

const mapStateToProps = state => ({
    branchId: state.base.branchId
  });
  const mapDispatchToProps = dispatch => ({
      setSelectedCustomerAction: (data) => dispatch(setSelectedCustomer(data)),
  });
  export default connect(mapStateToProps, mapDispatchToProps)(SearchCustomer);
