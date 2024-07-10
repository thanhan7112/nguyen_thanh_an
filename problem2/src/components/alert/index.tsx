import { Alert } from "@mui/material";
import React from "react";

type IProps = {
    alertMessage: string,
    onClose: () => void,
}

const AlertComponent = ({alertMessage, onClose}: IProps) => {
    return (
        <Alert
          variant="outlined"
          severity="error"
          sx={{
            position: 'absolute',
            top: 24,
            right: 0,
            transform: 'translateX(-24px)',
            zIndex: 9999,
            color: '#ffffff',
            backgroundColor: "#b6626242",
            width: 'fit-content',
            textAlign: 'center'
          }}
          onClose={onClose}
        >
          {alertMessage}
        </Alert>
    )
}

export default AlertComponent;