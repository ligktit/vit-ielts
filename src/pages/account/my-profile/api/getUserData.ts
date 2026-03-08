
export const GET_USERDATA = "";

export type UserData = {
  viewer: {
    id: string;
    email: string;
    userData: {
      phoneNumber: string;
      avatar?: {
        node: {
          mediaDetails: {
            sizes: Array<{
              sourceUrl: string;
              width: string;
            }>;
          };
          srcSet: string;
        };
      };
      dateOfBirth: string;
      gender: ["male" | "female", string];
      isPro: boolean;
      proExpirationDate?: string;
      // paymentHistory: {
      //   amount: number,
      //   content: string,
      //   paymentDate: string
      // }[]
    };
    name: string;
  };
};