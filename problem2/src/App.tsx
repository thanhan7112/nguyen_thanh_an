import React, { useEffect, useMemo, useState } from 'react';
import { TypeAccount, TypeToken, TypeTokenSelected } from './model/token';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import { ethers } from 'ethers';
import AlertComponent from './components/alert';
import { NoBorderTextField, style } from './styles/style-mui';
import './styles/app.scss';

const listMaxSlippage = [0.05, 0.1, 0.5, 1]

function App() {
  const [listTokens, setListTokens] = useState<TypeToken[]>([]);
  const [openKey, setOpenkey] = useState<null | string>(null);
  const [searchToken, setSearchToken] = useState('');
  const [account, setAccount] = useState<TypeAccount | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isMaxSlippage, setIsMaxSlippage] = useState(false);
  const [slippageSelected, setSlippageSelected] = useState(0.05)
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
    const fetchData = async () => {
      try {
        const response = await fetch('https://interview.switcheo.com/prices.json');
        if (!response.ok) {
          setAlertMessage('Network response was not ok');
          setTimeout(() => setAlertMessage(null), 3000);
        }
        const data: TypeToken[] = await response.json();
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
      } catch (error) {
        setAlertMessage('Error fetching token data');
        setTimeout(() => setAlertMessage(null), 3000);
      }
    };
  
    fetchData();
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
  }, [searchToken, listTokens])

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = provider.getSigner();
        const address = (await signer).address;
        const balance = await provider.getBalance(address);
        const formattedBalance = ethers.formatEther(balance);
        setAccount({
          address,
          amount: formattedBalance
        });
      } catch (error) {
        setAlertMessage('Failed to connect MetaMask');
        setTimeout(() => setAlertMessage(null), 3000);
      }
    } else {
      setAlertMessage('MetaMask is not installed. Please install MetaMask.');
      setTimeout(() => setAlertMessage(null), 3000);
    }
  };

  return (
    <div>
      {account
        && <div className='account'>
          <div className='info'>{account?.address}</div>
          <div className='info'>{account?.amount} ETH</div>
        </div>}
      <div className='container'>
        {alertMessage && (
          <AlertComponent alertMessage={alertMessage} onClose={() => setAlertMessage(null)} />
        )}
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
          <div className='container-form'>
            <div className='wrap from'>
              <div className='wallet'>
                <span className='balance'>$ {tokenSelected.from.amount && (tokenSelected.from.price * tokenSelected.from.amount).toFixed(2)}</span>
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
                  <img src={`assets/icons/${tokenSelected?.from.currency}.svg`} alt={tokenSelected?.from.currency} />
                  {tokenSelected?.from.currency}
                  <img src='assets/icons/dropdown.svg' alt="dropdown" />
                </button>
              </div>
            </div>

            {/* swap icon */}
            <div className='swap-button' onClick={handleSwap}>
              <img className={`swap ${isRotated ? 'rotate' : 'rotate-back'}`} src='assets/icons/swap.svg' alt="swap" />
            </div>

            <div className='wrap to'>
              <div className='wallet'>
                <span className='balance'>$ {tokenSelected.to.amount && (tokenSelected.to.price * tokenSelected.to.amount).toFixed(2)}</span>
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
          <div className='swap-footer'>
            <div className='max-slippage'>
              <span className='label'>
                Max Slippage:
              </span>
              <div className='max-slippage__value' onClick={() => setIsMaxSlippage((prev) => !prev)}>
                <span className='title'>{slippageSelected}%</span>
                <img className={isMaxSlippage ? 'rotate' : 'rotate-back'} src='assets/icons/dropdown.svg' alt="dropdown" />
              </div>
            </div>
            <div className={`max-slippage__dropdown ${isMaxSlippage ? 'open' : 'close'}`}>
              <div className='list-slippage'>
                {listMaxSlippage.map((e) => (
                  <button className={`slippage-option ${slippageSelected === e && 'selected'}`} onClick={() => setSlippageSelected(e)}>
                    {e}%
                  </button>
                ))}
              </div>
            </div>
            <div className='list-info'>
              <div className='row-info'>
                <span className='label'>Rate</span>
                <span className='title'>
                  {tokenSelected.from.amount
                    ? `1 ${tokenSelected.from.currency} = ${(tokenSelected.from.price / tokenSelected.to.price).toFixed(5)} ${tokenSelected.to.currency}`
                    : '---'
                  }
                </span>
              </div>
              <div className='row-info'>
                <span className='label'>Minimum Received</span>
                <span className='title'>{
                  tokenSelected.from.amount
                    ? `${(tokenSelected.from.price / tokenSelected.to.price - tokenSelected.from.price / tokenSelected.to.price * slippageSelected / 100).toFixed(5)} ${tokenSelected.to.currency}`
                    : '---'
                }</span>
              </div>
              <div className='row-info'>
                <span className='label'>Price Impact</span>
                <span className='title'>{tokenSelected.from.amount ? `0.01%` : '---'}</span>
              </div>
              <div className='row-info'>
                <span className='label'>Gas Refund</span>
                <span className='title'>{tokenSelected.from.amount ? `0.001%` : '---'}</span>
              </div>
            </div>
            <button className='button-submit' onClick={connectWallet}>
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
