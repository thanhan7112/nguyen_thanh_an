interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string; // Added blockchain field to interface
}

interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
}

//Assume BoxProps has been created and has the appropriate data types.
interface Props extends BoxProps {}

const priorities: { [key: string]: number } = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
};

const WalletPage: React.FC<Props> = ({children, ...rest}: Props) => {
    const balances = useWalletBalances();
    const prices = usePrices();

    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance: WalletBalance) => {
                const balancePriority = priorities[balance.blockchain] || -99;
                return balancePriority > -99 && balance.amount > 0;
            })
            .sort((lhs: WalletBalance, rhs: WalletBalance) => {
                const leftPriority = priorities[lhs.blockchain] || -99;
                const rightPriority = priorities[rhs.blockchain] || -99;
                return rightPriority - leftPriority;
            });
    }, [balances]);

    const formattedBalances = useMemo(() => {
        return sortedBalances.map((balance: WalletBalance) => ({
            ...balance,
            // Specifying the appropriate number of decimal places is better for very small or very large numbers.
            formatted: balance.amount.toFixed(2),
        }));
    }, [sortedBalances]);

    const rows = useMemo(() => {
        return formattedBalances.map((balance: FormattedWalletBalance) => {
            const usdValue = (prices[balance.currency] || 0) * balance.amount;
            return (
                <WalletRow
                    className={classes.row}
                    key={balance.currency}
                    amount={balance.amount}
                    usdValue={usdValue}
                    formattedAmount={balance.formatted}
                />
            );
        });
    }, [formattedBalances, prices]);

    return (
        <div {...rest}>
            {rows}
        </div>
    );
}
