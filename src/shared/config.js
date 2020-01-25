export default {
    ENV: process.env.NODE_ENV,
    VERSION: process.env.REACT_APP_APP_VERSION,
    BASENAME: '/',
    API_URL: process.env.REACT_APP_API_URL,
    IMAGE_URL: "https://client.algoretail.co.il/media/images",
    PRODUCT_URL: "https://client.algoretail.co.il/media/images/products",
    IMAGE_CACHE_VERSION: process.env.REACT_APP_IMAGE_CACHE_VERSION || "v1",
    PUBLIC_URL: process.env.PUBLIC_URL,
}