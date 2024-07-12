interface WalletBalance {
    currency: string;
    amount: number;
  }

//   FormattedWalletBalance can extend WalletBalance and only add the necessary additional data types.
  interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
  }
  
  interface Props extends BoxProps {
  
  }

  // When you use React.FC<Props>, TypeScript will automatically know what props your component expects, so there's no need to specify them twice.
  const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const prices = usePrices();
  
        // Using switch is not necessary; we can use an object and return an exception -99 if no match is found.
        // For example: {Osmosis: 100, Ethereum: 50, Arbitrum: 30, Zilliqa: 20, Neo: 20}
        // We can use it as follows: getPriority[blockchain] || -99
      const getPriority = (blockchain: any): number => {
        switch (blockchain) {
          case 'Osmosis':
            return 100
          case 'Ethereum':
            return 50
          case 'Arbitrum':
            return 30
          case 'Zilliqa':
            return 20
          case 'Neo':
            return 20
          default:
            return -99
        }
      }
  
    const sortedBalances = useMemo(() => {
      return balances.filter((balance: WalletBalance) => {
            // Create the variable balancePriority but do not use it
            const balancePriority = getPriority(balance.blockchain);
            
            // The variable lhsPriority is not declared in the function sortedBalances.
            // The logic if (lhsPriority > -99) { if (balance.amount <= 0) { return true; }} is not appropriate. 
            // Instead, it should use return balance.amount > 0 && balancePriority > -99.
            if (lhsPriority > -99) {
               if (balance.amount <= 0) {
                 return true;
               }
            }
            return false
          }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
            // The getPriority function is called multiple times during each filtering and sorting operation, causing unnecessary repeated calculations.
              const leftPriority = getPriority(lhs.blockchain);
            const rightPriority = getPriority(rhs.blockchain);
            // Based on the getPriority you provided, using if and else if in this case is unnecessary. 
            // You can use if and else or a "conditional operator" instead.
            // Ex: return leftPriority > rightPriority ? -1 : 1
            if (leftPriority > rightPriority) {
              return -1;
            } else if (rightPriority > leftPriority) {
              return 1;
            }
      });
      // prices is not used to recalculate sortedBalances and is unnecessary.
    }, [balances, prices]);
  

    // formattedBalances is created but not used.
    const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
      return {
        ...balance,
        // You should specify the exact number of decimal places.
        // Ex: toFixed(2)
        formatted: balance.amount.toFixed()
      }
    })
  
    const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
        const usdValue = prices[balance.currency] * balance.amount;
        // Using the index as a key in a map is not recommended because it can cause performance issues and rendering errors. It is better to use a more unique value like balance.currency.
      return (
        <WalletRow 
          className={classes.row}
          key={index}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      )
    })
  
    return (
      <div {...rest}>
        {rows}
      </div>
    )
  }