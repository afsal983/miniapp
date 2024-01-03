import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import DeleteIcon from './../../assets/images/delete-icon.png';
import { Button } from '@mui/material';
import { connect } from 'react-redux';
import { setSelectedProducts } from '../../redux/actions';
import * as _ from "lodash";

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


function CartItemTable({selectedProductList, setSelectedProductsAction}) {
  
  const deleteItem = (item) => {
    const newArray = selectedProductList.filter(i => i.id !== item.id);
    setSelectedProductsAction(newArray);
  }
  return (
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
            <StyledTableCell align="center">DISC</StyledTableCell>
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
              <StyledTableCell align="left" >{row.name}</StyledTableCell>
              <StyledTableCell align="center">
                <input
                  type="text"
                  className="form-control"
                  value={row.employee}
                />
              </StyledTableCell>
              <StyledTableCell align="center">
                <input type="text" className="form-control" value={row.price} />
              </StyledTableCell>
              <StyledTableCell align="center">
                <input type="text" className="form-control" value={row.count} />
              </StyledTableCell>
              <StyledTableCell align="center">
                <input type="text" className="form-control" value={row.disc} />
              </StyledTableCell>
              <StyledTableCell align="center">{row.final}</StyledTableCell>
              <StyledTableCell align="center">
                <Button className="btn-tranparent-0" onClick={()=> deleteItem(row)}>
                  <img src={DeleteIcon} alt="delete icon" />
                </Button>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
const mapStateToProps = state => ({
  selectedProductList: state.base.selectedProductList || [],
});
const mapDispatchToProps = dispatch => ({
  setSelectedProductsAction: (data) => dispatch(setSelectedProducts(data)),
});
export default connect(mapStateToProps, mapDispatchToProps)(CartItemTable);
