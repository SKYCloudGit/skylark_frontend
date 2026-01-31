import React from "react";
import { Pagination } from "@mui/material";
import { styled } from "@mui/material/styles";
import CustomDropdown from "../Components/CustomDropdown"; // ✅ Import your custom dropdown

const CustomPaginationContainer = styled("div")({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "16px",
  padding: "20px 10px",
});

const StyledPagination = styled(Pagination)(() => ({
  "& .MuiPaginationItem-root": {
    borderRadius: "50px",
    padding: "6px 12px",
    color: "#7C3AED",
    border: "1px solid #e0e0e0",
    backgroundColor: "#fff",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    "&:hover": {
      backgroundColor: "#f3e8ff",
    },
    "&.Mui-selected": {
      backgroundColor: "#7C3AED",
      color: "#fff",
      fontWeight: 600,
      borderColor: "#7C3AED",
      boxShadow: "0 0 0 2px rgba(124, 58, 237, 0.2)",
    },
  },
  "& .MuiPaginationItem-ellipsis": {
    color: "#7C3AED",
  },
}));

const CustomPagination = ({ count, page, onChange, rowsPerPage, onRowsPerPageChange }) => {
  const handlePageChange = (_, value) => {
    if (value > 0 && value <= count) {
      onChange(value - 1); // MUI is 1-indexed, convert to 0-indexed
    }
  };

  const rowOptions = [
    { id: 5, title: "5 Rows" },
    { id: 10, title: "10 Rows" },
    { id: 25, title: "25 Rows" },
  ];

  return (
    <CustomPaginationContainer>
      {/* ✅ CustomDropdown for rows per page */}
      <div style={{ minWidth: "50px" }}>
        <CustomDropdown
          options={rowOptions}
          value={rowsPerPage}
          onChange={(val) => onRowsPerPageChange(parseInt(val, 10))}
          placeholder="Rows per page"
        />
      </div>

      {/* Pagination Component */}
      <StyledPagination
        count={count}
        page={page + 1}
        onChange={handlePageChange}
        shape="square"
        showFirstButton
        showLastButton
      />
    </CustomPaginationContainer>
  );
};

export default CustomPagination;
 




// code to add for every render of the custom pagination components
// const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);


//   const handleChangePage = (newPage) => {
//     if (newPage >= 0 && newPage < Math.ceil(meters.length / rowsPerPage)) {
//       setPage(newPage);
//     }
//   };


//   const handleChangeRowsPerPage = (newRows) => {
//     setRowsPerPage(newRows);
//     setPage(0);
//   };
  
//   <CustomPagination
//     count={Math.ceil(meters.length / rowsPerPage)}
//     page={page + 1}  // Convert zero-based index to one-based
//     onChange={(newPage) => setPage(newPage - 1)} // Convert back to zero-based
//     rowsPerPage={rowsPerPage}
//     onRowsPerPageChange={handleChangeRowsPerPage}
//   />;







//   {meters
//     .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//     .map((meter) => (

//     ))}




//     {/* ✅ Custom Pagination Component with Props */}
//             <CustomPagination
//               count={Math.ceil(meters.length / rowsPerPage)}
//               page={page}
//               onChange={handleChangePage}
//               rowsPerPage={rowsPerPage}
//               onRowsPerPageChange={handleChangeRowsPerPage}
//             />