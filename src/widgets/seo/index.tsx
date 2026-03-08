import Head from "next/head";
import parse from "html-react-parser";

export const SEOHeader = ({
  fullHead: fullHeadString,
  title,
}: {
  fullHead: string;
  title: string;
}) => {
  const fullHead = parse(fullHeadString);
  return (
    <Head>
      <title>{title}</title>
      {fullHead}
    </Head>
  );
};
