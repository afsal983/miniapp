import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Button, Typography,Divider, responsiveFontSizes } from '@mui/material';
import CheckoutItemTable from '../../components/checkout/item-table';
import { useState, useEffect,useRef } from 'react';
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
    "* 0 -",
    "{backspace}"
  ]
};


const Checkout = ({ selectedProductList, selectedCustomer, selectedBranch, globalSettings }) => {
  console.log(selectedBranch)
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

  console.log(globalSettings);

  useEffect(() => {
    if(!selectedProductList.length) {
      navigate(ROUTES.CART)
    }
    loadInintialData()
  }, [])


  useEffect(() => {
    calculateData();
  }, [selectedProductList, tip, additionalDiscount, paymentModes])

  const calculateData = async () => {
    
    const subTotalBeforeDiscountOnProduct = selectedProductList.map(item => (item.price * item.count)).reduce((a, b) => a + b, 0)
    const subTotalAfterDiscountOnProduct = selectedProductList.map(item => (item.price * item.count)  - (item.price * item.count * item.discount/100)).reduce((a, b) => a + b, 0);

    const totalAfterOverallDiscount = subTotalAfterDiscountOnProduct - ((subTotalAfterDiscountOnProduct * additionalDiscount)/100);

console.log(subTotalBeforeDiscountOnProduct)
console.log(totalAfterOverallDiscount)

    
    const customerSavingAfterDiscount = subTotalBeforeDiscountOnProduct - totalAfterOverallDiscount;
    const customerSavingInTaxes = customerSavingAfterDiscount * additionalDiscount / 100;
    // const customerSaving = (customerSavingAfterDiscount + customerSavingInTaxes).toFixed(2);
    setDiscount(customerSavingAfterDiscount.toFixed(2))
    console.log(customerSavingInTaxes)
    console.log(additionalDiscount)
   
    console.log(totalAfterOverallDiscount)

    const taxRate = globalSettings.find(i => i.name === 'taxValue') || '0';

    const calculatedTax = ((totalAfterOverallDiscount) * parseInt(taxRate.value, 10))/100;
    const taxSaving = (customerSavingAfterDiscount * parseInt(taxRate.value)/100).toFixed(2)
    console.log(taxSaving)
    const customerSaving = customerSavingAfterDiscount !==0?(JSON.parse(customerSavingAfterDiscount) + JSON.parse(taxSaving)):0
    console.log(calculatedTax)

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
        }
        setPaymentModes(paymentsModesArray)
      }
    }
  };

  const changeOne = (name,value) =>{
    if ( name=== 'additionalTip') {
      setTip(value ? parseInt(value) : 0)
    } else if(name === 'additionalDiscount'){
      setAdditionalDiscount(value  ? parseInt(value ) : 0)
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

  console.log(selectedProductList)

  const payout = async () => {
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
      "price": item.price,
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

   
    const payments = paymentModes.map(i => ({ value: i.value, payment_type: i.id })).filter(i => i.value);
    console.log(payments + 'pay')
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

    const result = await axios.post(`/instantinvoice?notify=1`, payload);
      console.log(result.data.data);
      const invoiceId = result.data.data[0].invoicenumber
      navigate(`${ROUTES.INVOICE}?id=${invoiceId}`)
      // print(`${ROUTES.INVOICE}?id=${invoiceId}`)
  }
  catch(error) {
      console.log(error);
      alert(error?.response?.message ||  error?.message)
    }
  }

  const loadInintialData = async () => {
    try {

      const paymentMode = await axios.get('/paymenttypes');
      await calculateData();
      setPaymentModes((paymentMode.data.data || []).map(i => ({ ...i, key: `paymentMode__${i.name.replace(' ', '_')}`, default_paymenttype: i.name === 'CASH', value: 0 })))
    } catch (error) {
      alert(error?.response?.message ||  error?.message)
    }
  }

  // paymentModes.map((item) =>{
  //   // delete 
  //   if(item.name === 'SPLIT'){
  //     // item.remove()
  //     delete item.splice(1, 1)
  //   console.log(item + 'deleted')}
  // })

  var removeByAttr = function(arr, attr, value){
    var i = arr.length;
    while(i--){
       if( arr[i] 
           && arr[i].hasOwnProperty(attr) 
           && (arguments.length > 2 && arr[i][attr] === value ) ){ 

           arr.splice(i,1);

       }
    }
    return arr;
}

removeByAttr(paymentModes, 'name', 'SPLIT');


  const navigate = useNavigate();

  const logout = () => { 
    store.dispatch(employeeLogout());
    navigate(ROUTES.EMPLOYEE_LOGIN, {replace: true})
  }


  const inputRef = useRef(null);
  const changeValue = (id) =>{
  try {
    paymentModes.map(async(item) =>{
      item["value"]=0
      document.getElementById('input'+item.id).value = item.value.toFixed(2)
    if(id===item.id){
      item["value"]=data.roundedTotal
      document.getElementById('input'+item.id).value = item.value.toFixed(2)
      const paymentMode = await axios.get('/paymenttypes');
    await calculateData();
    setPaymentModes((paymentMode.data.data || []).map(i => ({ ...i, key: `paymentMode__${i.name.replace(' ', '_')}`, default_paymenttype: i.name === item.name, value: 0 })))
    }
    // document.getElementsByClassName('inputField').value=item.value
  })
    
  } catch (error) {
    alert(error?.response?.message ||  error?.message)
  }
  
  }


  const setFocusToTextBox = (id) =>{
    document.getElementById(id).focus();
}
  
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
          <Button
            variant="outlined"
            className="btn btn-primary"
            sx={{borderColor:'#fff', color:'#fff'}}
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
            sx={{borderColor:'#fff', color:'#fff', marginLeft: '12px' }}
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
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={() => logout()}
          >
            <LogoutOutlined />
          </IconButton>
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
              {data.customerSaving === 0?null:  <><Grid item md={6} xs={6}>
                  <Typography variant="h4" component="h4">
                    Customer Savings
                  </Typography>
                </Grid><Grid item md={6} xs={6}>
                    <Typography
                      variant="h4"
                      component="h4"
                      className="total-amount"
                    >
                      {data.customerSaving}
                    </Typography>
                  </Grid></>}
               {tip == 0?null: <><Grid item md={6} xs={6}>
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
                  {discount == 0?null: <><Grid item md={6} xs={6}>
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
                    <Typography onClick={()=>{
                      // console.log(item.name)
                      // console.log(item.value)
                      changeValue(item.id)}} variant="h3">{item.name}</Typography>
                    <input
                      ref={inputRef}
                      id={'input'+item.id}
                      type="number"
                      value={item.value}
                      className="form-control inputField"
                      onChange={(e)=>{
                        changeOne(item.key,e.target.value)
                      }}
                      onFocus={() => {
                        setInputName(item.key)
                      }
                      }
                    />
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
                <Divider style={{margin:'10px'}} />
                  <Grid container className="groups-button">
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setTip(10)}>
                        {' '}
                        10 {currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setTip(20)}>
                        {' '}
                        20 {currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setTip(30)}>
                        {' '}
                        30 {currency.value}
                      </Button>
                    </Grid>
                    <Grid item md={3}>
                      <Button variant="outlined" className="btn btn-outline-grey" onClick={() => setTip(40)}>
                        {' '}
                        40 {currency.value}
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
                        onChange={(e)=>{
                          changeOne(`additionalTip`,e.target.value)
                        }}
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
                <Divider style={{margin:'10px'}} />
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
                        onChange={(e)=>{
                          changeOne(`additionalDiscount`,e.target.value)
                        }}
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
                    mergeDisplay={true}
                    autoUseTouchEvents={true}
                    useButtonTag={true}
                    maxLength={100}
                  />
                </Grid>
                <Grid item xs={3}>
                <Button
            variant="outlined"
            className="btn btn-primary"
            sx={{borderColor:'#fff', color:'#fff',height:'100%',width:'100%',flexDirection:'column' }}
            onClick={() => payout(true)}
          >
           <Typography style={{fontSize:25,fontWeight:'bold'}}> Pay </Typography>
           <Typography> ({data.roundedTotal}) {currency.value} </Typography>
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
  selectedBranch: state.base.selectedBranch,
  selectedProductList: state.base.selectedProductList || [],
  globalSettings: state.base.globalSettings
});
const mapDispatchToProps = dispatch => ({
  setSelectedProductsAction: (data) => dispatch(setSelectedProducts(data)),
});
export default connect(mapStateToProps, mapDispatchToProps)(Checkout);
