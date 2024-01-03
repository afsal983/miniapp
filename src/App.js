import React, { useEffect } from 'react';
import './styles/Main.scss';
import LoginPage from './pages/login';
import {
  Route,
  Routes,
  useNavigate
} from 'react-router-dom';
import EmployeeLogin from './pages/employer-login';
import ProductCart from './pages/cart';
import Checkout from './pages/checkout';
import InvoiceSlip from './pages/invoice';
import AddCustomer from './pages/add-customer';
import SearchCustomer from './pages/search-customer';
import { connect } from 'react-redux';
import { store } from './redux/store';
import { employeeLogout, resetState } from './redux/actions';
import axios from './http/axios-auth3';
import { setSelectedCustomer } from './redux/actions';

export const ROUTES = {
  HOME: '/',
  CART: '/cart',
  EMPLOYEE_LOGIN: '/employee-login',
  ADD_CUSTOMER: '/add-customer',
  SEARCH_CUSTOMER: '/search-customer',
  CHECKOUT: '/checkout',
  INVOICE: '/invoice//*',
  LoginPage:'/logout'
}

const AuthGuardInterceptor = ({ children, path, branchToken, employeeToken, selectedProductList}) => {
  const navigate = useNavigate();
  useEffect(() => {
    console.log(path)
    console.log(selectedProductList)
    if(path === ROUTES.CHECKOUT && !selectedProductList.length) {
       navigate(ROUTES.CART)
       return;
    }
    if (!branchToken) {
      navigate(ROUTES.HOME)
      return;
    }
    else if (!employeeToken) {
      navigate(ROUTES.EMPLOYEE_LOGIN)
      return;
    }
  }, [])
  return children;
};
const mapStateToProps = state => ({
  branchToken: state.base.branchToken,
  employeeToken: state.base.employeeToken,
  selectedProductList: state.base.selectedProductList || [],
});
const mapDispatchToProps = dispatch => ({});
const AuthGuard = connect(mapStateToProps, mapDispatchToProps)(AuthGuardInterceptor);

const AuthGuardForLoginInterceptor = ({ path, children, branchToken, employeeToken }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (path === ROUTES.HOME && branchToken && !employeeToken) {
      navigate(ROUTES.EMPLOYEE_LOGIN)
      return;
    }
    if (path === ROUTES.EMPLOYEE_LOGIN && !branchToken) {
      navigate(ROUTES.HOME)
      return;
    }
    if (branchToken && employeeToken) {
      navigate(ROUTES.CART)
      return;
    }
  }, [])
  return children;
};

const AuthGuardForLogin = connect(mapStateToProps, mapDispatchToProps)(AuthGuardForLoginInterceptor);

const App = ({logoutFlag, globalLogoutFlag}) => {

  const [logoutFlagCounter, setLogoutFlagCounter] = React.useState(undefined);
  const [globalLogoutFlagCounter, setGlobalLogoutFlagCounter] = React.useState(undefined);
  const navigate = useNavigate();

  
  // useEffect(()=>{
  //   const payload = {
  //     searchbyname: "walkin",
  //     // searchbyemail: event.target.value,
  //     // searchbyphone: event.target.value,
  //     row: 0,
  //     rowperpage: 100
  // }
  // axios.post(`/customers`, payload).then(response => {
  //     console.log(JSON.stringify(response.data.data) + 'customer')
  //     response.data.data.map((item)=>{store.dispatch(setSelectedCustomer(item))})
    
  //     // setCustomer(response?.data?.data || [])
  // }).catch(error => {
  //     alert(error?.response?.message ||  error?.message)
  // });
  // },[])

  useEffect(()=>{
    if(logoutFlag && logoutFlag !== logoutFlagCounter) {
      setLogoutFlagCounter(logoutFlag);
      store.dispatch(employeeLogout());
      navigate(ROUTES.EMPLOYEE_LOGIN);
    }
  },[logoutFlag])

  useEffect(()=>{
    if(globalLogoutFlag && globalLogoutFlag !== globalLogoutFlagCounter) {
      setGlobalLogoutFlagCounter(logoutFlag);
      store.dispatch(resetState());
      navigate(ROUTES.HOME);
    }
  },[globalLogoutFlag])




  return (
    <>
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={
            <AuthGuardForLogin path={ROUTES.HOME}>
              <LoginPage />
            </AuthGuardForLogin>} />
        <Route
          path={ROUTES.EMPLOYEE_LOGIN}
          element={
            <AuthGuardForLogin path={ROUTES.EMPLOYEE_LOGIN}>
              <EmployeeLogin />
            </AuthGuardForLogin>} />
        <Route
          path={ROUTES.CART}
          element={
            <AuthGuard>
              <ProductCart />
            </AuthGuard>}
        />
        <Route
          path={ROUTES.CHECKOUT}
          element={
            <AuthGuard path={ROUTES.CHECKOUT}>
              <Checkout />
            </AuthGuard>
          }
        />
        <Route
          path={ROUTES.INVOICE}
          element={
            <AuthGuard>
              <InvoiceSlip />
            </AuthGuard>
          } />
        <Route
          path={ROUTES.ADD_CUSTOMER}
          element={
            <AuthGuard>
              <AddCustomer />
            </AuthGuard>
          } />
        <Route
          path={ROUTES.SEARCH_CUSTOMER}
          element={
            <AuthGuard>
              <SearchCustomer />
            </AuthGuard>
          } />
      </Routes>
    </>
  );
}
const mapStateToPropsApp = state => ({
  logoutFlag: state.base.logoutFlag,
  globalLogoutFlag: state.base.globalLogoutFlag,
});
const mapDispatchToPropsApp = dispatch => ({});
export default connect(mapStateToPropsApp, mapDispatchToPropsApp)(App);

