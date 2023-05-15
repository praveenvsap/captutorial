const cds = require("@sap/cds");

cds.on("bootstrap", async (app) => {
  await cds.mtx.in(app);
  const provisioning = await cds.connect.to("ProvisioningService");
  provisioning.impl(require("./provisioning"));
});

module.exports = cds.server;
