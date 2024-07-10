import { styled, SxProps, TextField } from "@mui/material";

export const NoBorderTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        color: 'rgb(255, 255, 255)',
        '& fieldset': {
            border: 'none',
        },
        '&:hover fieldset': {
            border: 'none',
        },
        '&.Mui-focused fieldset': {
            border: 'none',
        },
    },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
        '-webkit-appearance': 'none',
        margin: 0,
    },
    '& input[type=number]': {
        '-moz-appearance': 'textfield',
    },
    "& .MuiInputBase-input.Mui-disabled": {
        WebkitTextFillColor: "rgb(147 147 147)",
    },
});

export const style: SxProps = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 420,
    maxWidth: '100%',
    bgcolor: 'rgb(49, 49, 49)',
    boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 8px 0px',
    borderRadius: '16px',
    overflow: 'hidden'
};