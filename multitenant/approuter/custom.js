const appRouter = require("@sap/approuter");
const router = appRouter();

router.first.use((req, res, next) => {
  console.log("Tenant host: ", process.env.TENANT_HOST);
  req.headers["x-custom-host"] = process.env.TENANT_HOST;

  console.log("The following request was made...");
  console.log("Method: ", req.method);
  console.log("URL: ", req.url);

  next();
});


router.start();