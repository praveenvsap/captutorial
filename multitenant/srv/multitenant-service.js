const colors = require("colors");

module.exports = (srv) => {
  srv.before("*", async (req) => {
    console.log(`Method: ${req.method}`.yellow.inverse);
    console.log(`Target: ${req.target.name}`.yellow.inverse);
  });
};
