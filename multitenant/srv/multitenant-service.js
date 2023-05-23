const colors = require("colors");

module.exports = async (srv) => {

  const northwindService = await cds.connect.to("NORTHWIND_SRV");
  const { Foo } = srv.entities;

  srv.before("*", async (req) => {
    console.log(`Method: ${req.method}`.yellow.inverse);
    console.log(`Target: ${req.target.name}`.yellow.inverse);
  });

  srv.on("READ", Foo, async (req) => {
    try {
      // const query = SELECT.from(Foo);
      // return await cds.tx(req).run(query);
      return await SELECT.from(Foo);
    } catch (err) {
      req.reject(err);
    }
  });

  srv.on("READ", "Products", async (req) => {
    try {
      return await northwindService.send({ query: req.query });
    } catch (err) {
      req.reject(err);
    }
  });
};
