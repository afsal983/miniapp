import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { connect } from 'react-redux';
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


function CheckoutItemTable({selectedProductList}) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="customized table" className="main-table">
        <TableHead>
          <TableRow>
            <StyledTableCell>SI</StyledTableCell>
            <StyledTableCell align="left">PRODUCT NAME</StyledTableCell>
            <StyledTableCell align="center">QTY</StyledTableCell>
            <StyledTableCell align="center">FINAL</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {selectedProductList.map((row, index) => (
            <StyledTableRow key={row.si}>
              <StyledTableCell component="th" scope="row">
                {index+1}
              </StyledTableCell>
              <StyledTableCell align="left">{row.name}</StyledTableCell>
              <StyledTableCell align="center">{row.count}</StyledTableCell>
              <StyledTableCell align="center">{row.final.toFixed(2)}</StyledTableCell>
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
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(CheckoutItemTable);