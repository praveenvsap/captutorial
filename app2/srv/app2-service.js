const cds = require("@sap/cds");

module.exports = async (srv) => {
   const DemoService = await cds.connect.to("DemoService");

   srv.on("someFunction", () => {
      return "New Service function...";
   });

   DemoService.on("demoEvent", (msg) =>
      console.log("Handler (App2 Service):", msg)
   );
};
