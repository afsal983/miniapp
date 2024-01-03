import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Button, IconButton, Typography } from '@mui/material';
import BrandLogo from './../../assets/images/logo-final.png';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ProductList from '../../components/cart/product-list';
import { useNavigate, useRoutes } from "react-router-dom";
import { connect } from 'react-redux';
import { ROUTES } from '../../App';
import DeleteIcon from '../../assets/images/delete-icon.png';
import * as _ from "lodash";
import { setSelectedBranch, setSelectedProducts, employeeLogout, setSelectedCustomer, setBranchRefreshToken } from '../../redux/actions';
import Keyboard from "react-simple-keyboard";
import axios from "../../http/axios-auth3";
import { store } from '../../redux/store';
import { LoginOutlined } from '@mui/icons-material';


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

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const ProductCart = ({ branchToken, selectedCustomer, selectedBranch, selectedProductList, setSelectedProductsAction, setSelectedBranchAction }) => {
  const [layoutName, setLayoutName] = React.useState("numbers");
  const [inputName, setInputName] = useState("default");
  const [branchList, setBranchList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [domainId, setdomainId] = useState(null);
  const keyboard = React.useRef();


  useEffect(() => {
    // console.log(ROUTES)
    loadBranches()

    //  setSelectedBranchAction()
    var token = parseJwt(branchToken)
    setdomainId(token.domain_id)
  }, []);

  function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  const loadBranches = () => {
    axios.get(`/branches_organizations`).then(response => {
      // console.log(response.data.data)
      setBranchList(response.data.data || [])
      // const selectedOption = response.data.data.map(item => item.branch_id)

      // if(selectedOption){
      //   console.log(`${selectedOption[0]}`)
      //   store.dispatch(setSelectedBranch(selectedOption[0]))
      //   console.log(selectedBranch)
      // }
    }).catch(error => {
      alert(error.response);
    });
    axios.get(`/employees/?branch_id=${selectedBranch}`).then(response => {
      setEmployeeList(response?.data?.data || []);
    }).catch(error => {
      alert(error?.response?.message || error?.message)
    })
  }



  const navigate = useNavigate();

  const handleChange = (type) => {
    setLayoutName(type);
  };

  const logout = () => {
    store.dispatch(employeeLogout());
    navigate(ROUTES.EMPLOYEE_LOGIN, { replace: true })
  }

  const onChangeAll = inputs => {
    const sP = _.cloneDeep(selectedProductList);
    const selectedIndex = inputName.split('__');
    sP[parseFloat(selectedIndex[2])][selectedIndex[1]] = inputs[inputName] ? parseFloat(inputs[inputName]) : 0;
    sP[parseFloat(selectedIndex[2])] = {
      ...sP[parseFloat(selectedIndex[2])],
      final: (sP[parseFloat(selectedIndex[2])].price * sP[parseFloat(selectedIndex[2])].count) - (sP[parseFloat(selectedIndex[2])].discount ? (sP[parseFloat(selectedIndex[2])].price * sP[parseFloat(selectedIndex[2])].count * sP[parseFloat(selectedIndex[2])].discount) / 100 : 0),
    }
    setSelectedProductsAction(sP);
  };

  const updateProductRow = (rowProductId, value) => {
    const sP = _.cloneDeep(selectedProductList);
    const selectedIndex = rowProductId.split('__');
    sP[parseFloat(selectedIndex[2])][selectedIndex[1]] = value ? parseFloat(value) : 0;
    sP[parseFloat(selectedIndex[2])] = {
      ...sP[parseFloat(selectedIndex[2])],
      final: (sP[parseFloat(selectedIndex[2])].price * sP[parseFloat(selectedIndex[2])].count) - (sP[parseFloat(selectedIndex[2])].discount ? (sP[parseFloat(selectedIndex[2])].price * sP[parseFloat(selectedIndex[2])].count * sP[parseFloat(selectedIndex[2])].discount) / 100 : 0),
    }
    setSelectedProductsAction(sP);
  }

  const setEmployeeNameForSelectedproduct = (value, id) => {
    const sP = _.cloneDeep(selectedProductList);
    for (const x of sP) {
      if (x.udid === id) {
        x.employee = value;
        break;
      }
    }
    setSelectedProductsAction(sP);
  }



  const handlePayNow = () => {
    navigate("/checkout")
  }
  const handleClose = () => {
    store.dispatch(employeeLogout());
    navigate(ROUTES.EMPLOYEE_LOGIN, { replace: true })
  }

  const deleteItem = (item) => {
    const newArray = selectedProductList.filter(i => i.id !== item.id);
    setSelectedProductsAction(newArray);
  }

  const total = selectedProductList.map(item => item.final).reduce((a, b) => a + b, 0);

  const branchOption = branchList.map(item => <MenuItem value={item.branch_id}>{item.name}</MenuItem>)

  const selectedOption = branchList.map(item => item.branch_id)

  return (
    <Grid container className="registration-screen">
      <Grid container>
        <Grid item md={7}>
          <Box className="cart-left-portion">
            <Box className="cart-header">
              <Grid container className='cart-header-inner'>
                <Grid item md={4}>
                  <Box className="account-credential">
                    <Typography
                      variant="h6"
                      component="h6"
                      className="accountHead1"
                    >
                      CUSTOMER
                    </Typography>
                    <Typography
                      variant="h6"
                      component="h6"
                      className="account-filled-info"
                      onClick={() => navigate('/search-customer')}
                    >
                      {selectedCustomer ? `${selectedCustomer.firstname} ${selectedCustomer.lastname}(${selectedCustomer.telephone})` : null}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item md={3}>
                  <Box className="cart-brand-logo">
                    <img
                      src={'https://app.smeeye.com/assets/images/' + domainId + '_logo.png'}
                      alt="Salon App"
                      loading="lazy"
                      className="brand-logo"
                      width={100}
                    />
                  </Box>
                </Grid>
                <Grid item md={4}>
                  <Box className="account-credential">
                    <Typography
                      variant="h6"
                      component="h6"
                      className="accountHead1"
                    >
                      BRANCH
                    </Typography>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={`${selectedBranch}`}
                      label="Branch"
                      onChange={(e) => setSelectedBranchAction(e.target.value)}
                      style={{ width: '11rem' }}
                    >
                      {branchOption}
                    </Select>
                  </Box>
                </Grid>
                <Grid item md={1} className="account-filled-info">
                  <Button style={{ backgroundColor: '#fda302' }}>
                    <IconButton
                      size="large"
                      edge="end"
                      color="inherit"
                      aria-label="menu"
                      style={{ paddingRight: '48%', color: 'black' }}
                      onClick={() => logout()}
                    >
                      <LoginOutlined />
                    </IconButton>
                  </Button>
                </Grid>
              </Grid>
              <Box className="cart-item-table-box">
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 700 }}
                    aria-label="customized table"
                    className="main-table"
                  >
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>SI</StyledTableCell>
                        <StyledTableCell align="left">PRODUCT NAME</StyledTableCell>
                        <StyledTableCell align="center">EMPLOYEE</StyledTableCell>
                        <StyledTableCell align="center">PRICE</StyledTableCell>
                        <StyledTableCell align="center">QTY</StyledTableCell>
                        <StyledTableCell align="center">DISC %</StyledTableCell>
                        <StyledTableCell align="center">FINAL</StyledTableCell>
                        <StyledTableCell align="center">&nbsp;</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedProductList.map((row, index) => (
                        <StyledTableRow key={row.si}>
                          <StyledTableCell component="th" scope="row">
                            {index + 1}
                          </StyledTableCell>
                          <StyledTableCell align="left">{row.name}</StyledTableCell>
                          <StyledTableCell align="center">
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={row.employee}
                              label="Employee"
                              onChange={(e) => setEmployeeNameForSelectedproduct(e.target.value, row.udid)}
                            >
                              {employeeList.map(item => <MenuItem value={item.id}>{item.name}</MenuItem>)}
                            </Select>
                          </StyledTableCell>
                          <StyledTableCell align="center" >
                            <input
                              type='number' 
                              step='any' 
                              inputMode='decimal' 
                              pattern='\d*'
                              className="form-control"
                              style={{ maxWidth: '90px' }}
                              value={row.price}
                              onChange={(e) => updateProductRow(`${row.udid}__price__${index}`, e.target.value)}
                              onFocus={() => {
                                handleChange('numbers')
                                setInputName(`${row.udid}__price__${index}`)
                              }
                              }
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <input
                              type="text"
                              className="form-control"
                              value={row.count}
                              onChange={(e) => updateProductRow(`${row.udid}__count__${index}`, e.target.value)}
                              onFocus={() => {
                                handleChange('numbers')
                                setInputName(`${row.udid}__count__${index}`)
                              }
                              }
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            <input
                              type="text"
                              className="form-control"
                              value={row.discount}
                              onChange={(e) => updateProductRow(`${row.udid}__discount__${index}`, e.target.value)}
                              onFocus={() => {
                                handleChange('numbers')
                                setInputName(`${row.udid}__discount__${index}`)
                              }
                              }
                            />
                          </StyledTableCell>
                          <StyledTableCell align="center">{row.final.toFixed(2)}</StyledTableCell>
                          <StyledTableCell align="center">
                            <Button className="btn-tranparent-0" onClick={() => deleteItem(row)}>
                              <img src={DeleteIcon} alt="delete icon" />
                            </Button>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
            <Box className="cart-footer">
              <Grid container className="cart-final-amount">
                <Grid item md={6}>
                  <Typography variant="h4" component="h4">
                    Total
                  </Typography>
                </Grid>
                <Grid item md={6}>
                  <Typography
                    variant="h4"
                    component="h4"
                    className="total-amount"
                  >
                    {total.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container className="cart-footer-action">
                <Grid item md={6}>
                  <Button variant="outlined" onClick={handleClose} className="btn btn-outline-grey">
                    Close
                  </Button>
                </Grid>
                <Grid item md={6}>
                  <Button variant="contained" onClick={handlePayNow} className="btn btn-primary" disabled={!selectedProductList.length}>
                    Pay
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
        <Grid item md={5}>
          <Grid container>
            <Grid item xs={12}>
              <Box className="cart-items-listD">
                <Box className="cart-item-tabs">
                  <ProductList />
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={12}>
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

            />
          </Grid>

        </Grid>
      </Grid>
    </Grid>
  );
};

const mapStateToProps = state => ({
  selectedCustomer: state.base.selectedCustomer,
  selectedBranch: state.base.selectedBranch,
  branchToken: state.base.branchToken,
  selectedProductList: state.base.selectedProductList || [],
});
const mapDispatchToProps = dispatch => ({
  setSelectedProductsAction: (data) => dispatch(setSelectedProducts(data)),
  setSelectedBranchAction: (data) => dispatch(setSelectedBranch(data)),
});
export default connect(mapStateToProps, mapDispatchToProps)(ProductCart);

