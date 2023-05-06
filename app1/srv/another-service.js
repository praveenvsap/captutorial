const cds = require("@sap/cds");

module.exports = async (srv) => {
   const externalService = await cds.connect.to("DemoService");
   srv.on("getName", () => {
      return "Milton";
   });

   externalService.on("demoEvent", (msg) =>
      console.log("Handler (Another Service):", msg)
   );
};
