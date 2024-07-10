export type TypeToken = {
    currency: string,
    date: string,
    price: number,
}

export type TypeTokenSelected = {
    from: TypeToken & { amount: number | undefined };
    to: TypeToken & { amount: number | undefined };
};

export type TypeAccount = {
    address: String,
    amount: String
}