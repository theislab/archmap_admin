import React from "react";
import { CircularProgress, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
}));

const LoadingSpinner = () => {
  const classes = useStyles();

  return (
    <div className={classes.spinnerContainer}>
      <CircularProgress />
    </div>
  );
};

export default LoadingSpinner;
