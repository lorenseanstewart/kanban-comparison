import { onRequest as qwikCityHandler } from '../.cloudflare/entry.cloudflare-pages';

export const onRequest: PagesFunction = async (context) => {
  return qwikCityHandler(context.request, context.env, context);
};
