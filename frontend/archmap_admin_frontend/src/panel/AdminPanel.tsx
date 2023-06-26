import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import CustomTable, { DataForTable } from "../reusables/CustomTable";
import { axiosInstance } from "../utils/AxiosInstance";
import { CustomTableProps } from "../reusables/CustomTable";
import LoadingSpinner from "../reusables/CircularSpinner";
import { login, logout } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";

const AdminPanel = () => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  const [users, setUsers] = useState<CustomTableProps>();
  const [dataForTable, setDataForTable] = useState<CustomTableProps>();

  const togglePermission = async (userId: any, value: boolean) => {
    // Update the user's permissions in the state
    console.log(userId);
    console.log("value is ", value);

    try {
      await axiosInstance.put("/users/" + userId + "/permission/", {
        id: userId,
        permission: value,
      });
      fetchPermissions();
    } catch (error) {
      console.log("error in togglePermission", error);
    }
  };

  const makeUserDataFromResponse = (response: any): CustomTableProps => {
    let userData: DataForTable[] = [];
    console.log(response.data);
    if (response.data) {
      response.data.forEach((user: any) => {
        let userPer = false;
        if (user.permission == null) {
          userPer = false;
        } else if (user.permission == "admin" || user.permission == "upload") {
          userPer = true;
        } else if (user.permission == "none") {
          userPer = false;
        }

        userData.push({
          id: user.id,
          email: user.email,
          role: user.role,
          permission: userPer,
        });
      });
    }
    console.log("userData", userData);
    const dataForTable: CustomTableProps = {
      data: userData,
      togglePermission: togglePermission,
    };
    return dataForTable;
  };

  // Function to fetch user permissions and requests from the backend
  const fetchPermissions = async () => {
    const response = await axiosInstance.get("/users");
    console.log(response.data);
    const tableData = makeUserDataFromResponse(response);
    setDataForTable(tableData);
  };

  useEffect(() => {
    fetchPermissions();

    console.log("useEffect");
  }, []);
  // Function to handle permission change for a user
  const handlePermissionChange = (userId: any, atlasId: any, checked: any) => {
    // Update the user's permissions in the state
    setUserPermissions((prevState) => {
      const updatedPermissions = [...prevState];
      const userIndex = -1;
      //   updatedPermissions.findIndex(
      //     // (user) => user.userId === userId
      //   );

      if (userIndex !== -1) {
        // User already exists in permissions list, update their permissions
        const user = updatedPermissions[userIndex];
        if (checked) {
          // Add the atlas to the user's permissions
          //   user.atlasIds.push(atlasId);
        } else {
          // Remove the atlas from the user's permissions
          //   user.atlasIds = user.atlasIds.filter((id) => id !== atlasId);
        }
      } else {
        // User doesn't exist in permissions list, create a new user object
        // updatedPermissions.push({ userId, atlasIds: [atlasId] });
      }

      return updatedPermissions;
    });
  };

  // Function to handle enabling access for a user request
  //   const handleEnableAccess = (userId) => {
  //     // Remove the user request from the state
  //     setUserRequests();

  //     //   prevState.filter((user) => user.userId !== userId)
  //     // Perform any necessary backend operations to enable access for the user
  //     // ...
  //   };

  return (
    // make it in the center

    <Container>
      <div
        style={{
          textAlign: "center",
          background: "#f2f2f2",
          padding: "10px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          marginLeft: 80,
        }}
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Helmholtz_Munich_Logo.jpg" // Replace with your actual logo or icon
          alt="Admin Logo"
          style={{ height: "30px", marginRight: "10px" }}
        />
        <Typography variant="h4" style={{ display: "inline-block" }}>
          Admin Panel
        </Typography>
      </div>
      {dataForTable ? <CustomTable {...dataForTable} /> : <LoadingSpinner />}
      <></>
    </Container>
  );
};

export default AdminPanel;
