const CANONICAL_HOST = "www.chopsticksguide.com";
const ROOT_HOST = "chopsticksguide.com";

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === ROOT_HOST) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname.endsWith("/")) {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = `${assetUrl.pathname}index.html`;
      return env.ASSETS.fetch(new Request(assetUrl, request));
    }

    return env.ASSETS.fetch(request);
  }
};
