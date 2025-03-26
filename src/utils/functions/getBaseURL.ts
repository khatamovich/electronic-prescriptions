const getBaseURL = (env: string, isAPI: boolean = false) => {
  if (env === 'production')
    return isAPI ? 'https://zordoc.uz' : 'https://mis.dmed.uz';

  return isAPI
    ? `https://${env}.test.dmed.uz`
    : `https://${env}-g2g.test.dmed.uz`;
};

export default getBaseURL;
