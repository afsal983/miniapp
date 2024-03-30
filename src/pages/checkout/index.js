import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Button, Typography, Divider, responsiveFontSizes } from '@mui/material';
import CheckoutItemTable from '../../components/checkout/item-table';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import * as _ from "lodash";
import { employeeLogout, resetState, setSelectedProducts } from '../../redux/actions';
import Keyboard from "react-simple-keyboard";
import axios from "../../http/axios-auth3";
import CloseIcon from '@mui/icons-material/Close';
import ArrowLeft from '@mui/icons-material/ChevronLeft';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import { LogoutOutlined } from '@mui/icons-material';
import { ROUTES } from '../../App';
import { store } from '../../redux/store';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const customLayout = {
  default: [
    "q w e r t y u i o p",
    "a s d f g h j k l",
    "{shift} z x c v b n m {backspace}",
    "{space}"
  ],
  shift: [
    "Q W E R T Y U I O P",
    "A S D F G H J K L",
    "{shift} Z X C V B N M {backspace}",
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


const Checkout = ({ selectedProductList, selectedCustomer, selectedEmployee, selectedBranch, globalSettings }) => {
  const [data, setData] = useState({
    subTotal: 0,
    calculatedTax: 0,
    customerSaving: 0,
    total: 0,
    roundedTotal: 0
  });
  const [layoutName, setLayoutName] = React.useState("numbers");
  const [inputName, setInputName] = useState("default");
  const [paymentModes, setPaymentModes] = useState([]);
  const [tip, setTip] = useState(0);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [openTipModal, setOpenTipModal] = useState(false);
  const [openDiscountModal, setOpenDiscountModal] = useState(false);
  const [newVal, setnewVal] = React.useState(null);
  const [discount, setDiscount] = React.useState(null);
  const keyboard = React.useRef();

  //Added by Afsal
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    if (!selectedProductList.length) {
      navigate(ROUTES.CART)
    }
    loadInintialData()
  }, [])


  useEffect(() => {
    calculateData();
  }, [selectedProductList, tip, additionalDiscount, paymentModes])

  const calculateData = async () => {

    const subTotalBeforeDiscountOnProduct = selectedProductList.map(item => (item.price * item.count)).reduce((a, b) => a + b, 0)
    const subTotalAfterDiscountOnProduct = selectedProductList.map(item => (item.price * item.count) - (item.price * item.count * item.discount / 100)).reduce((a, b) => a + b, 0);

    const totalAfterOverallDiscount = subTotalAfterDiscountOnProduct - ((subTotalAfterDiscountOnProduct * additionalDiscount) / 100);


    const customerSavingAfterDiscount = subTotalBeforeDiscountOnProduct - totalAfterOverallDiscount;
    const customerSavingInTaxes = customerSavingAfterDiscount * additionalDiscount / 100;
    // const customerSaving = (customerSavingAfterDiscount + customerSavingInTaxes).toFixed(2);
    setDiscount(customerSavingAfterDiscount.toFixed(2))
    const taxRate = globalSettings.find(i => i.name === 'taxValue') || '0';

    const calculatedTax = ((totalAfterOverallDiscount) * parseInt(taxRate.value, 10)) / 100;
    const taxSaving = (customerSavingAfterDiscount * parseInt(taxRate.value) / 100).toFixed(2)
    const customerSaving = customerSavingAfterDiscount !== 0 ? (JSON.parse(customerSavingAfterDiscount) + JSON.parse(taxSaving)) : 0
    const total = totalAfterOverallDiscount + calculatedTax + tip;
    const roundedTotal = Math.round(total);
    const sumToBesubtractFromDefault = paymentModes.filter(i => !i.default_paymenttype).map(i => i.value ? parseInt(i.value) : 0).reduce((a, b) => a + b, 0);
    for (const x of paymentModes) {
      if (x.default_paymenttype) {
        x.value = total - sumToBesubtractFromDefault;
        break;
      }
    }
    setPaymentModes(paymentModes);
    setData({
      subTotal: subTotalAfterDiscountOnProduct.toFixed(2),
      calculatedTax: calculatedTax.toFixed(2),
      customerSaving: customerSaving,
      total,
      roundedTotal
    })
    setnewVal(data.roundedTotal)
  }


  const setPaymentModeValue = (key, value) => {
    const paymentsModesArray = _.cloneDeep(paymentModes);
    for (const p of paymentsModesArray) {
      if (p.key === key) {
        p.value = value ? parseFloat(value) : 0
        break;
      }
    }
    setPaymentModes(paymentsModesArray)
  }
  const setAuthCodeValue = (authKey,authValue) => {
    const paymentsModesArray = _.cloneDeep(paymentModes);
    for (const p of paymentsModesArray) {
      if(p.authKey === authKey){
        p.auth_code = authValue ? authValue : ''
        break;
      }
    }
    setPaymentModes(paymentsModesArray)
  }


  const onChangeAll = inputs => {
    for (const x in inputs) {
      if (x === 'additionalTip') {
        setTip(inputs[x] ? parseInt(inputs[x]) : 0)
      }
      if (x === 'additionalDiscount') {
        setAdditionalDiscount(inputs[x] ? parseInt(inputs[x]) : 0)
      } else {
        const paymentsModesArray = _.cloneDeep(paymentModes);
        for (const p of paymentsModesArray) {
          if (p.key === x) {
            p.value = inputs[x] ? parseFloat(inputs[x]) : 0
            break;
          }
          if (p.authKey === x) {
            p.auth_code = inputs[x] ? inputs[x] : ''
            break;
          }
        }
        setPaymentModes(paymentsModesArray)
      }
    }
  };

  const setAdditionalTipOnChange = (value) => {
    setTip(value ? parseInt(value) : 0)
  }

  const setAdditionalDiscountOnChange = (value) => {
    setAdditionalDiscount(value ? parseInt(value) : 0)
  }


  const changeOne = (name, value) => {
    if (name === 'additionalTip') {
      setTip(value ? parseInt(value) : 0)
    } else if (name === 'additionalDiscount') {
      setAdditionalDiscount(value ? parseInt(value) : 0)
    } else {
      const paymentsModesArray = _.cloneDeep(paymentModes);
      for (const p of paymentsModesArray) {
        if (p.key === name) {
          p.value = value ? parseFloat(value) : 0
          break;
        }
      }
      setPaymentModes(paymentsModesArray)
    }
  }



  const payout = async () => {
    if (isButtonDisabled) {
      return; // Prevent double-click if the button is already disabled
    }
    // Disable the button to prevent double-click
    setIsButtonDisabled(true);
    

    try {
      if (!selectedProductList.length) {
        return;
      }
      const x = paymentModes.find(i => i.value);
      if (!x) {
        alert(`Please add atleast one payment method`);
        return;
      }

      const retails = selectedProductList.filter(i => i.type === 2).map(item => ({
        "productid": item.id,
        "price": parseFloat(item.price),
        "quantity": item.count,
        "discount": item.discount,
        "employeeid": item.employee,
        "deleted": 0
      }));
      const products = selectedProductList.filter(i => i.type === 1).map(item => ({
        "productid": item.id,
        "price": item.price,
        "quantity": item.count,
        "discount": item.discount,
        "employeeid": item.employee,
        "deleted": 0
      }));
      const packages = selectedProductList.filter(i => i.type === 3).map(item => ({
        "productid": item.id,
        "price": item.price,
        "quantity": item.count,
        "discount": item.discount,
        "employeeid": item.employee,
        "deleted": 0
      }));


      const payments = paymentModes.map(i => ({ value: Math.round(i.value), payment_type: i.id,auth_code:i.auth_code,is_authcode:i.is_authcode })).filter(i => Math.round(i.value));
      const payload = {
        "customer": selectedCustomer.id,
        "branch_id": selectedBranch,
        "reminder_count": 1,
        "products": products,
        "retails": retails,
        "packages": packages,
        "payments": payments,
        "discount": additionalDiscount,
        "tip": tip,
        "payment_method": 0,
        "notify": 0,
        "createevent": 1,
        "event_id": 0
      }

      var result;
      var remember = document.getElementById('chkNotifyMe')
      var authInput = document.getElementsByClassName('auth')
      
      if(payments){
        for (const i of payments) {
          
          if(i.is_authcode === true && i.auth_code === ''){
            alert('Please Enter Auth Code')
            return
          }
        }
      }
      if (remember.checked) {
        result = await axios.post(`/instantinvoice?notify=1`, payload); 
      } else {
        result = await axios.post(`/instantinvoice?notify=0`, payload);
      }
      const invoiceId = result.data.data[0].id
      navigate(`${ROUTES.INVOICE}?id=${invoiceId}`)

    }
    catch (error) {
      alert(error?.response?.message || error?.message)
    }
  }

  const loadInintialData = async () => {
    try {

      const paymentMode = await axios.get('/paymenttypes');
      await calculateData();
      paymentMode.data.data.map(i => console.log(i.default_paymenttype))


      const paymentModeType = (paymentMode.data.data || []).map(i => ({ ...i, key: `paymentMode__${i.name.replace(' ', '_')}`,authKey:`auth_${i.name.replace('','_')}` ,default_paymenttype: i.default_paymenttype, value: 0,auth_code:'' }))
      const paymentFilter = paymentModeType.find((item) => item.default_paymenttype)
      if (!paymentFilter) {
        const setPayment = paymentModeType.find((item) => item.id === 1)
        if (setPayment) { setPayment.default_paymenttype = true }

      }

      setPaymentModes(paymentModeType)
      // console.log(paymentMode.data.data || []).map(i => ({ ...i, key: `paymentMode__${i.name.replace(' ', '_')}`, default_paymenttype: i.default_paymenttype === true?i.default_paymenttype === true:i.id === 1, value: 0 }))
    } catch (error) {
      alert(error?.response?.message || error?.message)
    } finally {
      // Enable the button after the asynchronous operation is completed
      setIsButtonDisabled(false);
    }
  }

  // paymentModes.map((item) =>{
  //   // delete 
  //   if(item.name === 'SPLIT'){
  //     // item.remove()
  //     delete item.splice(1, 1)
  //   console.log(item + 'deleted')}
  // })

  var removeByAttr = function (arr, attr, value) {
    var i = arr.length;
    while (i--) {
      if (arr[i]
        && arr[i].hasOwnProperty(attr)
        && (arguments.length > 2 && arr[i][attr] === value)) {

        arr.splice(i, 1);

      }
    }
    return arr;
  }

  removeByAttr(paymentModes, 'name', 'SPLIT');


  const navigate = useNavigate();

  const logout = () => {
    store.dispatch(employeeLogout());
    navigate(ROUTES.EMPLOYEE_LOGIN, { replace: true })
  }


  const inputRef = useRef(null);
  const changeValue = (id) => {
    try {
      paymentModes.map(async (item) => {
        item["value"] = 0
        document.getElementById('input' + item.id).value = item.value.toFixed(2)
        if (id === item.id) {
          item["value"] = data.roundedTotal
          document.getElementById('input' + item.id).value = Math.round(item.value)
          const paymentMode = await axios.get('/paymenttypes');
          await calculateData();
          setPaymentModes((paymentMode.data.data || []).map(i => ({ ...i, key: `paymentMode__${i.name.replace(' ', '_')}`,authKey:`auth_${i.name.replace('','_')}`, default_paymenttype: i.name === item.name, value: 0,auth_code:'' })))
        }
        // document.getElementsByClassName('inputField').value=item.value
      })

    } catch (error) {
      alert(error)
    }

  }


  const setFocusToTextBox = (id) => {
    document.getElementById(id).focus();
  }

  let per_5 = Math.round(data.subTotal / 100 * 5)
  let per_10 = Math.round(data.subTotal / 100 * 10)
  let per_15 = Math.round(data.subTotal / 100 * 15)
  let per_20 = Math.round(data.subTotal / 100 * 20)
  // console.log(per) 

  const currency = globalSettings.find(i => i.name === 'currency');
  const taxName = globalSettings.find(i => i.name === 'taxName');
  const taxRate = globalSettings.find(i => i.name === 'taxValue') || 0;
  return (
    <Grid container className="registration-screen">
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
            Checkout
          </Typography>

          <input type='checkbox' id='chkNotifyMe' />
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: '500', marginRight: '8px' }}>
            Notifyme
          </Typography>


          <Button
            variant="outlined"
            className="btn btn-primary"
            sx={{ borderColor: '#fff', color: '#fff' }}
            onClick={() => {
              setOpenDiscountModal(false)
              setOpenTipModal(true)
            }}
          >
            Add Tip
          </Button>
          <Button
            variant="outlined"
            className="btn btn-primary"
            sx={{ borderColor: '#fff', color: '#fff', marginLeft: '12px' }}
            onClick={() => {
              setOpenTipModal(false)
              setOpenDiscountModal(true)
            }}
          >
            Add Discount
          </Button>
          {/* <Button
            variant="outlined"
            className="btn btn-primary"
            sx={{borderColor:'#fff', color:'#fff', marginLeft: '12px' }}
            onClick={() => payout(true)}
          >
            Pay ({data.roundedTotal}) {currency.value}
          </Button> */}
          {/*<IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={() => logout()}
          >
            <LogoutOutlined />
          </IconButton>*/}
          <PopupState variant="popover" popupId="demo-popup-menu">
            {(popupState) => (
              <React.Fragment>
                <Button 
                  variant="outlined"  
                  sx={{ borderColor: '#fff', color: '#fff', marginLeft: '12px' , borderRadius: 50}} 
                  endIcon={<KeyboardArrowDownIcon />}
                  {...bindTrigger(popupState)}>
                  {selectedEmployee.firstname + " " + selectedEmployee.lastname}
                </Button>
                <Menu {...bindMenu(popupState)}>
                  {/*<MenuItem onClick={popupState.close}>Profile</MenuItem>*/}
                  {/*<MenuItem onClick={popupState.close}>My account</MenuItem>*/}
                  <MenuItem onClick={() => logout()}>Logout</MenuItem>
                </Menu>
              </React.Fragment>
            )}
          </PopupState>
        </Toolbar>
      </AppBar>
      <Grid container>
        <Grid item md={6}>
          <Box className="cart-left-portion">
            <Box className="cart-header">
              <Box className="checkout-item-table-box">
                <CheckoutItemTable />
              </Box>
            </Box>
            <Box className="cart-footer">
              <Grid container className="checkout-final-amount">
                <Grid item md={6} xs={6}>
                  <Typography variant="h4" component="h4">
                    Sub Total
                  </Typography>
                </Grid>
                <Grid item md={6} xs={6}>
                  <Typography
                    variant="h4"
                    component="h4"
                    className="total-amount"
                  >
                    {data.subTotal}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={6}>
                  <Typography variant="h4" component="h4">
                    {taxName?.value || 'Tax'}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={6}>
                  <Typography
                    variant="h4"
                    component="h4"
                    className="total-amount"
                  >
                    {data.calculatedTax}  ({taxRate?.value || 0}%)
                  </Typography>
                </Grid>
                {data.customerSaving === 0 ? null : <><Grid item md={6} xs={6}>
                  <Typography variant="h4" component="h4">
                    Customer Savings
                  </Typography>
                </Grid><Grid item md={6} xs={6}>
                    <Typography
                      variant="h4"
                      component="h4"
                      className="total-amount"
                    >
                      {(data.customerSaving).toFixed(2)}
                    </Typography>
                  </Grid></>}
                {tip == 0 ? null : <><Grid item md={6} xs={6}>
                  <Typography variant="h4" component="h4">
                    Tip
                  </Typography>
                </Grid><Grid item md={6} xs={6}>
                    <Typography
                      variant="h4"
                      component="h4"
                      className="total-amount"
                    >
                      {tip.toFixed(2)}
                    </Typography>
                  </Grid></>}
                {discount == 0 ? null : <><Grid item md={6} xs={6}>
                  <Typography variant="h4" component="h4">
                    Discount
                  </Typography>
                </Grid><Grid item md={6} xs={6}>
                    <Typography
                      variant="h4"
                      component="h4"
                      className="total-amount"
                    >
                      {discount}
                    </Typography>
                  </Grid></>}

                <Grid item md={6} xs={6}>
                  <Typography variant="h4" component="h4">
                    Total
                  </Typography>
                </Grid>
                <Grid item md={6} xs={6}>
                  <Typography
                    variant="h4"
                    component="h4"
                    className="total-amount"
                  >
                    {data.total.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item md={6} xs={6}>
                  <Typography variant="h4" component="h4">
                    Rounded Total
                  </Typography>
                </Grid>
                <Grid item md={6} xs={6}>
                  <Typography
                    variant="h4"
                    component="h4"
                    className="total-amount"
                  >
                    {data.roundedTotal}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
        <Grid item md={6}>
          <Box className="checkout-right-portion">
            <Box className="checkout-product-info">
              <Box className="checkout-right-table">
                <Grid container className="info-table-top tableDown">
                  {paymentModes.map(item => <Grid item md={3} xs={6} key={item.id}>
                    <Typography onClick={() => {
                      changeValue(item.id)
                    }} variant="h3">{item.name}</Typography>
                    <input
                      ref={inputRef}
                      id={'input' + item.id}
                      type='number'
                      step='any'
                      inputMode='decimal'
                      pattern='\d*'
                      value={Math.round(item.value)}
                      className="form-control inputField"
                      onChange={(e) => {
                        setPaymentModeValue(item.key, e.target.value)
                      }}
                      onFocus={() => {
                        setInputName(item.key)
                      }
                      }
                    />
                    {item.is_authcode === true ?<Typography>
                      <input
                      ref={inputRef}
                      id={'auth' + item.id}
                      type='text'
                      style={{marginTop:5}}
                      placeholder='Authcode'
                      value={item.auth_code}
                      className="form-control inputField auth"
                      onChange={(e) => {
                        
                        setAuthCodeValue(item.authKey, e.target.value)
                      }}
                      onFocus={() => {
                        setInputName(item.authKey)
                      }
                      }
                    />
                    </Typography>:null}
                  </Grid>)}
                </Grid>
              </Box>
              {openTipModal ? <Box class="modal-layout">
                <button
                  type="button"
                  onClick={() => setOpenTipModal(false)}
                  className="btn btn-close-modal"
                >
                  <CloseIcon />
                </button>
                <Box>
                  <Grid item md={12} xs={12}>
                    <Typography variant="h5" component="h5" className='text-center'>
                      Customer Tip
                    </Typography>
                  </Grid>
                  <Divider style={{ margin: '10px' }} />
                  <Grid container className="groups-button">
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setTip(per_5)}>
                        {' '}
                        {per_5 + '' + currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setTip(per_10)}>
                        {' '}
                        {per_10 + '' + currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setTip(per_15)}>
                        {' '}
                        {per_15 + '' + currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setTip(per_20)}>
                        {' '}
                        {per_20 + '' + currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={5}>
                      <input
                        type="text"
                        value={tip}
                        id='txtTip'
                        className="form-control"
                        placeholder="Custom tip"
                        autoFocus
                        onChange={(e) => setAdditionalTipOnChange(e.target.value)}
                        onFocus={() => {
                          setInputName(`additionalTip`)
                        }
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box> : null}
              {openDiscountModal ? <Box class="modal-layout">
                <button
                  type="button"
                  onClick={() => setOpenDiscountModal(false)}
                  className="btn btn-close-modal"
                >
                  <CloseIcon />
                </button>
                <Box>
                  <Grid item md={12} xs={12}>
                    <Typography variant="h5" component="h5" className='text-center'>
                      Customer Discount (%)
                    </Typography>
                  </Grid>
                  <Divider style={{ margin: '10px' }} />
                  <Grid container className="groups-button">
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setAdditionalDiscount(5)}>
                        {' '}
                        5% {((data.subTotal * 5) / 100).toFixed(2)} {currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setAdditionalDiscount(10)}>
                        {' '}
                        10% {((data.subTotal * 10) / 100).toFixed(2)} {currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setAdditionalDiscount(15)}>
                        {' '}
                        15% {((data.subTotal * 15) / 100).toFixed(2)} {currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setAdditionalDiscount(20)}>
                        {' '}
                        20% {((data.subTotal * 20) / 100).toFixed(2)} {currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={5}>
                      <input
                        type="text"
                        value={additionalDiscount}
                        id='txtDiscount'
                        className="form-control"
                        placeholder="Additional Discount (%)"
                        autoFocus
                        onChange={(e) => setAdditionalDiscountOnChange(e.target.value)}
                        onFocus={() => {
                          setInputName(`additionalDiscount`)
                        }
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box> : null}
            </Box>
            <Box>
            </Box>
            <Box className="checkout-bottom-sec">
              <Grid container className="checkout-amount-editor">

                <Grid item xs={9}>
                  <Keyboard
                    keyboardRef={r => (keyboard.current = r)}
                    theme={"hg-theme-default oddTheme1"}
                    onChangeAll={onChangeAll}
                    layoutName={layoutName}
                    layout={customLayout}
                    inputName={inputName}
                    // mergeDisplay={true}
                    // autoUseTouchEvents={true}
                    // useButtonTag={true}
                    maxLength={100}
                  />
                </Grid>
                <Grid item xs={3}>
                  {/* <Typography>
                    <input
                      ref={inputRef}
                      id={'input' + item.id}
                      style={{
                        backgroundColor: '#fda302',
                        color: '#fff',
                        fontSize: 25,
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                      type='number'
                      step='any'
                      inputMode='decimal'
                      pattern='\d*'
                      value={Math.round(data.total)}
                      className="form-control inputField"
                      onChange={(e) => {
                        setPaymentModeValue(e.target.value)
                      }}
                    onFocus={() => {
                      setInputName(item.key)
                    }
                    }
                    />
                  </Typography> */}
                  <Button
                    variant="outlined"
                    className="btn btn-primary"
                    sx={{ borderColor: '#fff', color: '#fff', height: '100%', width: '100%', flexDirection: 'column' }}
                    onClick={() => payout(true)}
                    disabled={isButtonDisabled}
                  >
                    <Typography style={{ fontSize: 20, fontWeight: 'bold' }} > Pay </Typography>

                    <Typography> ({Math.round(data.total)}) {currency.value} </Typography>
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};
const mapStateToProps = state => ({
  selectedCustomer: state.base.selectedCustomer,
  selectedEmployee: state.base.userData,
  selectedBranch: state.base.selectedBranch,
  selectedProductList: state.base.selectedProductList || [],
  globalSettings: state.base.globalSettings
});
const mapDispatchToProps = dispatch => ({
  setSelectedProductsAction: (data) => dispatch(setSelectedProducts(data)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Checkout);
