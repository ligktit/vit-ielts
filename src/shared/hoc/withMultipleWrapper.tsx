import { GetServerSideProps, GetServerSidePropsContext } from "next";
import _ from "lodash";

type DataFetchingFunction = (
  context: GetServerSidePropsContext
) => ReturnType<GetServerSideProps>;

export function withMultipleWrapper(
  ...propsFunctions: DataFetchingFunction[]
): DataFetchingFunction {
  return async (context: GetServerSidePropsContext) => {
    const results = await Promise.all(propsFunctions.map((fn) => fn(context)));

    const result = _.merge({}, ...results);

    return result;
  };
}
