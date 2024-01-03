import React from 'react';
import Box from '@mui/material/Box';
const Layout = ({ children }) => {
  return <Box className="page-wrapper" sx={{ flexGrow: 1 }}>{children}</Box>;
};

export default Layout;
