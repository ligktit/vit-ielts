
export const GET_USER_PAYMENT_HISTORY = "";

export type UserPaymentHistory = {
  viewer: {
    userData: {
      paymentHistory?: {
        amount: number,
        content: string,
        paymentDate: string
      }[]
    };
  };
};