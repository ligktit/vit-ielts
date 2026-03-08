
export const SEND_EMAIL_MUTATION = "";

export type SendEmailMutationVariables = {
  input: {
    email: string;
    message: string;
    name: string;
    subject: string;
  };
};

export type SendEmailMutationResponse = {
  sendContactEmail: {
    message: string;
    success: boolean;
  };
};
