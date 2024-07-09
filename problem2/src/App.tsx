import React, { useEffect, useMemo, useState } from 'react';
import './styles/app.scss';
import { TypeToken } from './model/token';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { SxProps } from '@mui/material/styles';
import { styled } from '@mui/system';

const style: SxProps = {
  position: 'absolute' as 'absolute',
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

type TypeTokenSelected = {
  from: TypeToken & { amount: number | undefined };
  to: TypeToken & { amount: number | undefined };
};

const NoBorderTextField = styled(TextField)({
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

function App() {
  const [listTokens, setListTokens] = useState<TypeToken[]>([]);
  const [openKey, setOpenkey] = useState<null | string>(null);
  const [searchToken, setSearchToken] = useState('')
  const [tokenSelected, setTokenSelected] = useState<TypeTokenSelected>({
    from: {
      currency: "USDC",
      date: "",
      price: 0,
      amount: undefined
    },
    to: {
      currency: "ETH",
      date: "",
      price: 0,
      amount: undefined
    }
  });
  const [isRotated, setIsRotated] = useState(false);

  useEffect(() => {
    (async () => {
      await fetch('https://interview.switcheo.com/prices.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data: TypeToken[]) => {
          setListTokens(data);
          if (data.length > 1) {
            setTokenSelected({
              from: {
                ...data[0],
                amount: undefined
              },
              to: {
                ...data[1],
                amount: undefined
              }
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching token data:', error);
        });
    })();
  }, []);

  const handleSwap = () => {
    if (tokenSelected) {
      setTokenSelected({
        from: tokenSelected.to,
        to: tokenSelected.from
      });
      setIsRotated(!isRotated);
    }
  };

  const handleFromAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value ? Number(event.target.value) : undefined;
    setTokenSelected((prev) => ({
      ...prev,
      from: {
        ...prev.from,
        amount
      },
      to: {
        ...prev.to,
        amount: amount !== undefined ? (amount * prev.from.price) / prev.to.price : undefined
      }
    }));
  };

  const filteredTokens = useMemo(() => {
    return listTokens.filter(token =>
      token.currency.toLowerCase().includes(searchToken.trim().toLowerCase())
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[searchToken, listTokens])

  return (
    <div className='container'>
      <Modal
        open={openKey != null}
        onClose={() => {
          setSearchToken('')
          setOpenkey(null)
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div className='box-modal'>
            <div className='box-header'>
              <div className='box-header__content'>
                <div className='box-header__left'>
                  <h3 className='title'>Select a token</h3>
                </div>
              </div>
              <span className='label'>You can search and select any token on FuncySwap.</span>
              <TextField
                placeholder='Search by token name'
                type='text'
                onChange={(event) => setSearchToken(event.target.value ?? '')}
                variant='outlined'
                className='search-input'
              />
            </div>
            <div className='line-border'></div>
            {filteredTokens.length > 0 
            ? <ul className='box-content'>
            {filteredTokens.map((e) => {
              return <li className='token' onClick={() => {
                setTokenSelected((prev) => {
                  const { from, to } = prev;

                  const newToAmount = (openKey === 'from' && from.amount != null)
                    ? from.amount * e.price / to.price
                    : (openKey !== 'from' && from.amount != null)
                      ? from.amount * from.price / e.price
                      : undefined;
                
                  return {
                    ...prev,
                    from: {
                      ...prev.from,
                      ...(openKey === 'from' && { ...e, amount: from.amount })
                    },
                    to: {
                      ...prev.to,
                      ...(openKey !== 'from' && { ...e }),
                      amount: newToAmount
                    }
                  };
                });
                setSearchToken('')
                setOpenkey(null)
              }}>
                <div className='token-content'>
                  <img className='token-icon' src={`assets/icons/${e.currency}.svg`} alt="" />
                  <div>
                    <h3 className='title'>{e.currency}</h3>
                    <p className='label'>{new Date(e.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                <img className='token-icon' src='assets/icons/warn.svg' alt="" />
              </li>
            })}
          </ul>
          : <div className='empty'>
              No results found.
          </div>
          }
          </div>
        </Box>
      </Modal>
      <div className='swap-header'>
        <h3 className='swap-header__title'>
          Swap
        </h3>
        <span className='label'>
          Instantly buy or sell tokens at superior prices
        </span>
      </div>
      <div className='swap-form'>
        <div className='wrap from'>
          <div className='wallet'>
            <img className='icon-wallet' src='assets/icons/wallet.svg' alt="wallet" />
            <span className='balance'>
              {tokenSelected.from.amount}
            </span>
          </div>
          <div className='field'>
            <NoBorderTextField
              placeholder='0.0'
              type='number'
              variant='outlined'
              className='token-amount-input'
              onChange={handleFromAmountChange}
              value={tokenSelected.from.amount}
            />
            <button className='button-select-token' onClick={() => setOpenkey('from')}>
              <img className='usdt' src={`assets/icons/${tokenSelected?.from.currency}.svg`} alt={tokenSelected?.from.currency} />
              {tokenSelected?.from.currency}
              <img className='usdt' src='assets/icons/dropdown.svg' alt="dropdown" />
            </button>
          </div>
        </div>

        {/* swap icon */}
        <div className='swap-button' onClick={handleSwap}>
          <img className={`swap ${isRotated ? 'rotate' : 'rotate-back'}`} src='assets/icons/swap.svg' alt="swap" />
        </div>

        <div className='wrap to'>
          <div className='wallet'>
            <img className='icon-wallet' src='assets/icons/wallet.svg' alt="wallet" />
            <span className='balance'>
              {tokenSelected.to.amount}
            </span>
          </div>
          <div className='field'>
            <NoBorderTextField
              placeholder='0.0'
              type='number'
              variant='outlined'
              className='token-amount-input'
              value={tokenSelected.to.amount !== undefined ? tokenSelected.to.amount : ''}
              disabled
            />
            <button className='button-select-token' onClick={() => setOpenkey('to')}>
              <img className='usdt' src={`assets/icons/${tokenSelected.to.currency}.svg`} alt={tokenSelected.to.currency} />
              {tokenSelected.to.currency}
              <img className='usdt' src='assets/icons/dropdown.svg' alt="dropdown" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
