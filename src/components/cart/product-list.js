import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import axios from "../../http/axios-auth3";
import { connect } from 'react-redux';
import { setSelectedProducts } from '../../redux/actions';
import * as _ from "lodash";
import { v4 as uuid } from 'uuid';
import { Grid } from '@mui/material';
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

function ProductList({ selectedProductList, setSelectedProductsAction, defaultEmployee, globalSettings }) {
  const [value, setValue] = React.useState(0);
  const [tabList, setTabList] = React.useState([]);
  const [subProductListing, setSubProductListing] = React.useState([])

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    loadInitialData();
  }, [])

  const selectProductItem = (data) => {
    const sP = _.cloneDeep(selectedProductList);
    const ifSelected = sP.find(i => i.id === data.id)
    if (ifSelected) {
      for (const x of sP) {
        if (x.id === data.id) {
          x.count = x.count + 1;
          x.final = (x.price * x.count) - (x.discount ? (x.price * x.count * x.discount) / 100 : 0);
        }
      }
      setSelectedProductsAction(sP);
    } else {
      console.log(data)
      const taxRate = globalSettings.find(i => i.name === 'taxValue') || 0;
      // console.log(parseInt(taxRate.value, 10)/100)

      let updatedPrice = data.type === 2 ? (data.price / (1 + parseFloat(taxRate.value)/100)).toFixed(2) : data.price;
      setSelectedProductsAction([...selectedProductList, {
        ...data,
        count: 1,
        price: updatedPrice,
        final: (updatedPrice * 1),
        discount: 0,
        employee: defaultEmployee,
        udid: uuid()
      }]);
    }
  }

  const loadInitialData = async() => {
    try {
     let productCategoryList =  await axios.get(`/productcategories?sort=asc`);
     const productCategories = productCategoryList.data.data || [];
     const productRequestArray = [];
     for(const pC of productCategories) {
      productRequestArray.push(axios.get(`/productsbycategoryid/${pC.id}`));
     }
     let productsL = await Promise.all(productRequestArray);
     productsL = productsL.map(i => (i.data.data || []));
     setTabList(productCategories);
     setSubProductListing(productsL)
    } catch(error) {
      alert(error?.response?.message ||  error?.message);
    }
  }

  // const productClick = async(id) =>{
  //   try{
  //     const productRequestArray = [];
  //     productRequestArray.push(axios.get(`/products?id=${id}`));
  //     // let productsL = await axios.get(`/products?id=${id}`)
  //     let productsL = await Promise.all(productRequestArray);
  //     console.log(productsL)
  //     productsL = productsL.map(i => (i.data.data || []));
  //     setSubProductListing(productsL)
  //   }catch (error) {
  //     alert(error?.response?.message || error?.message);
  //   }
  // }

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', maxHeight: '33rem' }} className="tab-content-pc">
      <Grid item xs={3}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={value}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{ borderRight: 1, borderColor: 'divider',maxHeight: '32rem' }}
          
        >
          {tabList.map((item, index) => <Tab label={item.name} {...a11yProps(index)} />)}
        </Tabs>
      </Grid>

      <Grid item xs={9} direction="row"
        alignItems="center"
        justifyContent="center">
         {subProductListing.map((item, categoryIndex) => <TabPanel value={value} index={categoryIndex}>
        <Box className="product-category-items" sx={{ maxHeight: '34rem', overflowY: 'scroll' }}>
          {item.map(product => <Box className={ selectedProductList.find(i => i.id === product.id) ? "product-item1 active-product" : "product-item1"} onClick={()=>selectProductItem(product)}>{product.name}</Box>)}
        </Box>
      </TabPanel>)}
      </Grid>
    </Box>
  );
}
const mapStateToProps = state => ({
  selectedProductList: state.base.selectedProductList || [],
  defaultEmployee: state.base.defaultEmployee,
  globalSettings: state.base.globalSettings
});
const mapDispatchToProps = dispatch => ({
  setSelectedProductsAction: (data) => dispatch(setSelectedProducts(data)),
});
export default connect(mapStateToProps, mapDispatchToProps)(ProductList);
