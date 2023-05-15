const cds = require("@sap/cds");

module.exports = async (srv) => {

   srv.on("someFunction", () => {
      return "New Service function...";
   });
};
