import React, { useEffect, useState } from 'react';
import './../styles/Invoice.scss';
import BrandLogo from './../assets/images/logo-final.png';
import { useSearchParams } from 'react-router-dom';
import axios from "../http/axios-auth3";
import moment from 'moment';
import { store } from '../redux/store';
import { setSelectedProducts } from '../redux/actions';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { connect } from 'react-redux';
import * as _ from "lodash";
import { Button, Grid } from '@mui/material';
import { useNavigate,useRoutes } from "react-router-dom";
import { setBranchToken } from '../redux/actions';
import { useDispatch } from 'react-redux';
import { employeeLogout } from '../redux/actions';
import { ROUTES } from '../App';

const InvoiceSlip = ({ globalSettings,branchToken}) => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [taxrate, setTaxRate] = useState(null);
  const [domainId, setdomainId] = useState(null);
  const [invoiceData,setInvoiceData] = useState({})
  const navigate = useNavigate();
  // const route = useRoutes();
  const dispatch = useDispatch()
  var totalAmount = 0;
  var lineDiscount = 0;
  useEffect(() => {
    
    if (searchParams.get('id')) {
      // loadInvoice()
     getInvoice()
      var token =parseJwt(branchToken)
      setdomainId(token.domain_id)
    }
  }, [])

  // console.log(route)
  

  function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
 

  const loadInvoice = async() => {
    store.dispatch(setSelectedProducts([]));
    await axios.get(`/invoice/${searchParams.get('id')}`).then(result => {
      const res = result.data.data[0];
      console.log(res)
      const d = {
        organisationName: res?.Branches_organization?.name,
        regName: res?.Branches_organization?.reg_name,
        address: res?.Branches_organization?.address,
        organisationTel: res?.Branches_organization?.telephone,
        organisationTaxID: res?.Branches_organization?.taxid,
        billNO: res?.invoicenumber,
        date: moment(res.date).format('MMM DD, YYYY'),
        customerName: `${res?.Customer?.firstname} ${res?.Customer?.lastname}`,
        productRows: res.Invoice_line.map(i => ({
          name: i.Product.name,
          price: parseFloat(i.price/(1-i.discount/100)),
          quantity: i.quantity,
          discount: parseFloat((i.discount).toFixed(2)),
          final: parseFloat((i.Product.price*i.quantity*i.discount/100).toFixed(2)),
          products:i.Product
        })),
        discount: parseFloat((res.discount).toFixed(2)),
        tip: parseFloat((res.tip).toFixed(2)),
        total: Math.round(res.total),
        tax: parseFloat((res.total / (1 + res.tax_rate) * res.tax_rate).toFixed(2)),
      }
      setTaxRate(res.tax_rate)
      setData(d)
      setLoading(false)
    //  invoicePrint('invoiceSlip')
      // setTimeout(invoicePrint('invoiceSlip'), 500);
     
      
    }).catch(error => {
      alert(error?.response?.message || error?.message);
      setLoading(false)
    })
    // await invoicePrint('invoiceSlip')
  }
  const getInvoice = async() => {
    store.dispatch(setSelectedProducts([]));
    await axios.get(`/getinvoiceprintdata/${searchParams.get('id')}`).then(result => {
      const res = result.data.data;
      console.log(res)
      setInvoiceData(res)
      setLoading(false)
    //  invoicePrint('invoiceSlip')
      // setTimeout(invoicePrint('invoiceSlip'), 500);
     
      
    }).catch(error => {
      alert(error?.response?.message || error?.message);
      setLoading(false)
    })
    // await invoicePrint('invoiceSlip')
  }


  const dis = () =>{
    // console.log(data.productRows)
    data.productRows?.map((i)=>{
      // console.log(i)
      totalAmount +=i.price * i.quantity;
      // console.log(i.products.price*i.quantity*i.discount/100)
      lineDiscount +=((i.price*i.quantity)*i.discount/100)
      // console.log(lineDiscount.toFixed(2))
 })
 }
 dis()
 
//  (parseFloat(data.total).toFixed(2) - parseFloat(data.tax).toFixed(2))

 const checkOutDiscount = ((parseFloat(totalAmount) - parseFloat(lineDiscount)) - parseFloat(data.total - data.tax))

 var totalDiscount = parseFloat(lineDiscount) + parseFloat(checkOutDiscount)

 const taxSaving = (parseFloat(lineDiscount + checkOutDiscount) *parseFloat(taxrate)).toFixed(2)

 const customerSaving = parseFloat(totalDiscount) + parseFloat(taxSaving)


  const currency = globalSettings.find(i => i.name === 'currency');
  const taxName = globalSettings.find(i => i.name === 'taxName');
  
  const taxRate = globalSettings.find(i => i.name === 'taxValue') || 0;

  // console.log(taxRate)
//   const a = invoiceData.itemlist.map((item, index) =>{
// console.log(item)
//   })

  const invoicePrint =(elem) => 
    {
        var mywindow = window.open('', 'PRINT', 'width=300');
    
        mywindow.document.write('<html><head><title>' + 'Customer Invoice' + '</title>');
        mywindow.document.write('</head><body >');
        mywindow.document.write(document.getElementById(elem).innerHTML);
      
    
        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/
    
        mywindow.print();
        mywindow.close();
    
        return true;
    }

    const logout = () => {
      store.dispatch(employeeLogout());
      navigate(ROUTES.EMPLOYEE_LOGIN, { replace: true })
    }

    // console.log(data.organisationTaxID)

  return (<>
    {loading ? <Box sx={{ display: 'flex', position: 'absolute', top: 0, bottom: 0, right: 0, left: 0, zIndex: 3, alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
    </Box> : <><div
      style={{
        width: '352px',
        padding: '15px',
        border: '2px solid grey',
        margin: '10px auto',
        boxSizing: 'border-box',
      }}
      id='invoiceSlip'
    >
      <table style={{ width: '100%',color:'#000000' }}>
        <tbody>
          <tr>
            <td style={{ textAlign: 'center' }}>
              <img src={invoiceData.logourl} alt="logo" style={{height: '82px', width: '158px'}} />
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', margin: '0px', fontWeight: '900', marginTop: "10px" }}>
                {invoiceData.branchname}
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>
              {/* <p style={{ fontSize: '14px', margin: '0px', fontWeight: '400' }}>
               {invoiceData.branchaddr}
              </p> */}
              {invoiceData.branchaddr?invoiceData.branchaddr.split('\n').map((item, i) => <p style={{ fontSize: '14px', margin: '0px', fontWeight: '400' }} key={i}>{item}</p>):null}
                
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', margin: '0px', fontWeight: '900' }}>
               {invoiceData.orgname}
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', marginTop: '-8px', fontWeight: '400' }}>
                Mobile: {invoiceData.telephone}
              </p>
            </td>
          </tr>
          {/* <tr>
            <td style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', marginTop: '-8px', fontWeight: '400' }}>
                {taxName.value}: {data.organisationTaxID}
              </p>
            </td>
          </tr> */}
         {invoiceData.taxid !=='' ?<tr>
            <td style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', marginTop: '-8px', fontWeight: '400' }}>
                {invoiceData.taxname + ' IN'}: {invoiceData.taxid}
              </p>
            </td>
          </tr>:null}
          <tr>
            <td style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '14px',
                  margin: '0px',
                  fontWeight: '600',
                  // marginTop: '10px',
                }}
              >
                Bill No: {invoiceData.billno}
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', margin: '0px', fontWeight: '400' }}>
                Date: {invoiceData?.date}
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', margin: '0px', fontWeight: '400' }}>
                Guest: {invoiceData?.guestname}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: '100%', borderSpacing: '0px', marginTop: '10px',borderColor:'#000000',color:'#000000' }}>
        <thead>
          <tr>
            <th
              style={{
                fontSize: '13px',
                padding: '6px 0px',
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
              }}
            >
              No
            </th>
            <th
              style={{
                fontSize: '13px',
                padding: '6px 0px',
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
              }}
            >
              Item
            </th>
            <th
              style={{
                fontSize: '13px',
                textAlign: 'center',
                padding: '6px 0px',
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
              }}
            >
              Price
            </th>
            <th
              style={{
                fontSize: '13px',
                textAlign: 'center',
                padding: '6px 0px',
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
              }}
            >
              Qty
            </th>
            <th
              style={{
                whiteSpace: 'nowrap',
                fontSize: '13px',
                textAlign: 'right',
                padding: '6px 0px',
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
              }}
            >
              Sub Total
            </th>
          </tr>
        </thead>
        <tbody>
          {(invoiceData.itemlist || []).map((item, index) => <tr>
            <td
              style={{
                fontSize: '13px',
                padding: '6px 0px',
                borderBottom: '1px solid #333',
              }}
            >
              {item[0]}
            </td>
            <td
              style={{
                fontSize: '13px',
                padding: '6px 0px',
                borderBottom: '1px solid #333',
              }}
            >
              {item[1]}
            </td>
            <td
              style={{
                fontSize: '13px',
                textAlign: 'center',
                padding: '6px 0px',
                borderBottom: '1px solid #333',
              }}
            >
              {item[2]}
            </td>
            <td
              style={{
                fontSize: '13px',
                textAlign: 'center',
                padding: '6px 0px',
                borderBottom: '1px solid #333',
              }}
            >
              {item[3]}
            </td>
            <td
              style={{
                fontSize: '13px',
                textAlign: 'right',
                padding: '6px 0px',
                borderBottom: '1px solid #333',
              }}
            >
              {item[4]}
            </td>
          </tr>)}
          <tr style={{borderBottom: '1px solid #333 !important',fontWeight:'900'}}>
            <td colSpan={2}  style={{borderBottom: '1px solid #333', }}></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px',borderBottom: '1px solid #333'}}>Total</td>
            <td style={{borderBottom: '1px solid #333'}}></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px',borderBottom: '1px solid #333' }}>{invoiceData.total}</td>
          </tr>
         {invoiceData.discount ===''?null:<tr>
            <td colSpan={2}></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px' }}>Discount</td>
            <td></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px' }}>{invoiceData.discount}</td>
          </tr>}
         {invoiceData.tip===''?null: <tr>
            <td colSpan={2}></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px' }}>Tip</td>
            <td></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px' }}>{invoiceData.tip}</td>
          </tr>}
          <tr>
            <td colSpan={2}></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px' }}>{invoiceData.taxname|| 'Tax'}</td>
            <td></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px' }}>{invoiceData.tax}</td>
          </tr>
          {/* <tr>
            <td colSpan={2}></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px' }}>Total</td>
            <td></td>
            <td style={{ fontSize: '13px', textAlign: 'right', padding: '2px 0px' }}>{data.total.toFixed(2)}</td>
          </tr> */}
          <tr>
            <td
              style={{
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
                fontWeight:'900'
              }}
            ></td>
            <td
              colSpan={2}
              style={{
                fontSize: '15px',
                textAlign: 'right',
                fontWeight: '600',
                padding: '8px 0px',
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
              }}
            >
              Bill Amount
            </td>
            <td
              style={{
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
              }}
            ></td>
            <td
              style={{
                fontSize: '15px',
                textAlign: 'right',
                fontWeight: '600',
                padding: '8px 0px',
                borderTop: '1px solid #333',
                borderBottom: '1px solid #333',
              }}
            >
              {invoiceData.billamount}
            </td>
          </tr>
        </tbody>
      </table>
      <table style={{ width: '100%' }}>
        <tbody>
        {invoiceData.customersavings === ''? null:<tr>
            <td style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '16px',
                  margin: '0px',
                  fontWeight: '600',
                  marginTop: '15px',
                }}
              >
                Your Savings : {invoiceData.customersavings}
              </p>
            </td>
          </tr>}
         
          <tr>
            <td style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: '16px',
                  margin: '0px',
                  fontWeight: '600',
                  marginTop: '15px',
                }}
              >
                Thank You
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', margin: '0px', fontWeight: '400' }}>
                Please Visit Again
              </p>
            </td>
          </tr>
          <tr>
            <td style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '14px', margin: '0px', fontWeight: '400' }}>
                Have a nice day
              </p>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
      <div>
        <Grid
          container
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
          alignContent="center"
          rowSpacing={1}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        >
          <Grid item xs={3} direction="row" justifyContent="space-between">
          <Button variant="contained" sx={{ml:1}} style={{width:'9.3rem',backgroundColor:'#fcab00 !important'}} onClick={()=>logout()}>Close</Button>
            <Button variant="contained" sx={{ml:1}} style={{width:'9.3rem',backgroundColor: '#fcab00 !important'}} onClick={()=>invoicePrint('invoiceSlip') }>Print</Button>
          </Grid>

        </Grid>

      </div></>
    }
  </>

  );
};
const mapStateToProps = state => ({
  globalSettings: state.base.globalSettings,
  branchToken: state.base.branchToken,
});
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(InvoiceSlip);
