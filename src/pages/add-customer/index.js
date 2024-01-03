import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import { Button, Typography } from '@mui/material';
import { Grid } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Keyboard from 'react-simple-keyboard';
import ArrowLeft from '@mui/icons-material/ChevronLeft';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import axios from '../../http/axios-auth3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Switch from '@mui/material/Switch';


const AddCustomer = ({ openModal, handleCloseModal }) => {
    const [inputs, setInputs] = useState({});
    const [layoutName, setLayoutName] = useState("default");
    const [showKeypad, setShowKeypad] = useState(false);
    const [inputName, setInputName] = useState("default");
    const [customerCategories, setCustomerCategories] = useState([])
    const [customerCategoriesId, setCustomerCategoriesId] = useState(null)
    const [eventChecked, setEventChecked] = useState(true);
    const [promoChecked, setPromoChecked] = useState(true);
    const [sexValue, setSexValue] = useState('1');
    const keyboard = useRef();
    const navigate = useNavigate()

    const handleChange = () => {
        setShowKeypad(true);
    };

    useEffect(() => {
        getCustomerCategories()
    }, [])

    const eventChange = (event) => {
        // eventChecked === false?setEventChecked(true):setEventChecked(false)
        setEventChecked(event.target.checked)

    };
    const promoChange = (event) => {
        setPromoChecked(event.target.checked)

    };

    const genderChange = (event) => {
        setSexValue(event.target.value)
    }
    //   console.log(eventChecked)

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

    // console.log(getInputValue("email"))

    function CustomerCategorieChange(event) {
        setCustomerCategoriesId(event.target.value)
    }

    const getCustomerCategories = async () => {
        await axios.get(`/customercategories`).then(result => {
            const res = result.data.data;
            console.log(res)
            setCustomerCategories(res)
            res.map((i) => {
                if (i.default_category === true) {
                    setCustomerCategoriesId(i.id)
                }
            })
        }).catch(error => {
            alert(error?.response?.message || error?.message);
        })
    }

    const submit = async () => {
        const payload = {
            "firstname": getInputValue("firstName"),
            "lastname": getInputValue("lastName"),
            "comment": getInputValue("comments"),
            "address": getInputValue("address"),
            "telephone": getInputValue("phoneNumber"),
            "email": getInputValue("email"),
            "sex": sexValue,
            "dob": getInputValue("dob") ? getInputValue("dob") : '1970-01-01',
            "deleted": 0,
            "category_id": customerCategoriesId,
            "CustomerPreference": { "customer_id": 0, "eventnotify": eventChecked, "promonotify": promoChecked, "dummy": true }
        }

        await axios.post(`/customer`, payload).then(response => {
            if (response.data.Title = 'OK') {
                if (response.data.status === 200) {
                    // toast.success('Success! Your action was completed.');
                    toast.success('New Customer Added Scuccefully.', {
                        position: toast.POSITION.TOP_RIGHT
                    });
                    setTimeout(() => {
                        navigate('/search-customer')
                    }, 1500);

                    // alert('New Customer Added Scuccefully.')

                }
            } else {
                alert(response.data.message)
            }
        })
            .catch(error => {
                toast.warning(error?.response?.data?.message || error?.message, {
                    position: toast.POSITION.TOP_RIGHT
                });
            });

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
                        Add Customer
                    </Typography>
                </Toolbar>
            </AppBar>
            <Grid item xs={12}>
                <Box>
                    <Box
                        noValidate
                        autoComplete="off"
                        component="form"
                        sx={{ padding: '16px' }}
                    >
                        <Grid container spacing={2}>
                            <Grid item md={4} xs={4}>
                                <Box className="field-group m-0">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter first name"
                                        onMouseEnter={handleChange}
                                        value={getInputValue("firstName")}
                                        onFocus={() => setInputName("firstName")}
                                        onChange={onChangeInput}
                                    />
                                </Box>
                            </Grid>
                            <Grid item md={4} xs={4}>
                                <Box className="field-group m-0">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter last name"
                                        onMouseEnter={handleChange}
                                        value={getInputValue("lastName")}
                                        onFocus={() => setInputName("lastName")}
                                        onChange={onChangeInput}
                                    />
                                </Box>
                            </Grid>
                            <Grid item md={4} xs={4}>
                                <Box className="field-group m-0">
                                    <label>Phone Number</label>
                                    {/* <PhoneInput
                                        country={'us'}
                                        type="tel"
                                        id='phone'
                                        className="form-control"
                                        placeholder="Enter phone number"
                                        onMouseEnter={handleChange}
                                        // value={getInputValue("phoneNumber")}
                                        onFocus={() => setInputName("phoneNumber")}
                                        onChange={onChangeInput}
                                    /> */}
                                    <input
                                        type="tel"
                                        id='phone'
                                        className="form-control"
                                        placeholder="Enter phone number"
                                        onMouseEnter={handleChange}
                                        value={getInputValue("phoneNumber")}
                                        onFocus={() => setInputName("phoneNumber")}
                                        onChange={onChangeInput}
                                    />
                                </Box>
                            </Grid>
                            <Grid item md={6} xs={6}>
                                <Box className="field-group m-0">
                                    <label>Email Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter email address"
                                        onMouseEnter={handleChange}
                                        value={getInputValue("email")}
                                        onFocus={() => setInputName("email")}
                                        onChange={onChangeInput}
                                    />
                                </Box>
                            </Grid>
                            <Grid item md={6} xs={6}>
                                <Box className="field-group m-0">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter address"
                                        onMouseEnter={handleChange}
                                        value={getInputValue("address")}
                                        onFocus={() => setInputName("address")}
                                        onChange={onChangeInput}
                                    />
                                </Box>
                            </Grid>
                            <Grid item md={4} xs={4}>
                                <Box className="field-group m-0">
                                    <label>Comments</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter comments"
                                        onMouseEnter={handleChange}
                                        value={getInputValue("comments")}
                                        onFocus={() => setInputName("comments")}
                                        onChange={onChangeInput}
                                    />
                                </Box>
                            </Grid>
                            <Grid item md={4} xs={4}>
                                <Box className="field-group m-0">
                                    <FormControl>
                                        <FormLabel id="demo-row-radio-buttons-group-label">
                                            Sex
                                        </FormLabel>
                                        <RadioGroup
                                            row
                                            aria-labelledby="demo-row-radio-buttons-group-label"
                                            name="row-radio-buttons-group"
                                            value={sexValue}
                                            // onFocus={() => setInputName("sex")}
                                            onChange={genderChange}
                                        >
                                            <FormControlLabel
                                                value="1"
                                                control={<Radio />}
                                                label="Male"
                                            />
                                            <FormControlLabel
                                                value="2"
                                                control={<Radio />}
                                                label="Female"
                                            />
                                            <FormControlLabel
                                                value="3"
                                                control={<Radio />}
                                                label="Other"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Box>
                            </Grid>
                            <Grid item md={4} xs={4}>
                                <Box className="field-group m-0">
                                    <label>Date Of Birth</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Enter dob"
                                        onMouseEnter={handleChange}
                                        value={getInputValue("dob")}
                                        onFocus={() => setInputName("dob")}
                                        onChange={onChangeInput}
                                    />
                                </Box>
                            </Grid>
                            <Grid item md={4} xs={4}>
                                <Box className="field-group m-0">
                                    <label>Tax Id</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter Tax Id"
                                        onMouseEnter={handleChange}
                                        value={getInputValue("taxId")}
                                        onFocus={() => setInputName("taxId")}
                                        onChange={onChangeInput}
                                    />
                                </Box>
                            </Grid>
                            <Grid item md={4} xs={4}>
                                <Box className="field-group m-0">
                                    <label>Category</label>
                                    <select
                                        id='cmbCustomerCategory'
                                        className="form-control"
                                        defaultValue={customerCategoriesId}
                                        onFocus={() => setInputName("category")}
                                        onChange={(event) => CustomerCategorieChange(event)}
                                    >
                                        {customerCategories?.map((item) => <option value={item.id} selected={item.default_category === true}>{item.name}</option>)}

                                        {/* <option value={1}>General Category</option>
                                        <option value={2}>General Category 1</option>
                                        <option value={3}>General Category 2</option> */}
                                    </select>
                                </Box>
                            </Grid>
                            <Grid item md={2} xs={2}>
                                <Box className="field-group m-0">
                                    <label>Event Notify</label>
                                    <br></br>
                                    <Switch
                                        checked={eventChecked}
                                        onChange={eventChange}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item md={2} xs={2}>
                                <Box className="field-group m-0">
                                    <label>Promo Notify</label>
                                    <br></br>
                                    <Switch
                                        checked={promoChecked}
                                        onChange={promoChange}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                </Box>
                            </Grid>
                            <ToastContainer />
                        </Grid>


                        <Grid container className="add-now-bttn" sx={{ paddingTop: '16px' }}>
                            <Grid item md={6} xs={6}>
                                <Button
                                    variant="outlined"
                                    onClick={handleCloseModal}
                                    sx={{ width: '100%' }}
                                    className="btn btn-outline-grey"
                                >
                                    Cancel
                                </Button>
                            </Grid>
                            <Grid item md={6} xs={6}>
                                <Button variant="contained"
                                    sx={{ width: '100%', borderRadius: 0 }}
                                    onClick={() => submit()}
                                    className="btn btn-primary">
                                    Submit
                                </Button>
                            </Grid>
                        </Grid>

                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box>
                    {showKeypad && <Keyboard
                        keyboardRef={r => (keyboard.current = r)}
                        inputName={inputName}
                        layoutName={layoutName}
                        onChangeAll={onChangeAll}
                    />}
                </Box>
            </Grid>
        </Grid>

    );
};

export default AddCustomer;
