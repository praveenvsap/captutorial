const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");
const privileged = new cds.User.Privileged();

module.exports = async (srv) => {
  const { Employees, Departments, Orders, BusinessPartners } = srv.entities;

  // connect to local db
  const db = await cds.connect.to("db");

  // connect to remote service
  const S4HANAService = await cds.connect.to("API_BUSINESS_PARTNER");

  srv.before("*", (req) => {
    //   let results = {};
    //   results.user = req.user.id;
    //   if (req.user.hasOwnProperty("locale")) {
    //      results.locale = req.user.locale;
    //   }
    //   results.scopes = {};
    //   results.scopes.identified = req.user.is("identified-user");
    //   results.scopes.authenticated = req.user.is("authenticated-user");
    //   results.scopes.Admin = req.user.is("Admin");
    //   results.tenant = req.user.tenant;
    //   console.log("User Details: ", results);
  });

  srv.on("READ", Employees, async (req, next) => {
    await srv.emit("demoEvent", { foo: 11, bar: "12" });
    await next();

    // return await SELECT.from(Employees);
  });

  srv.on("demoEvent", (msg) => console.log("Handler 1 (Demo Service):", msg));

  srv.on("demoEvent", (msg) => console.log("Handler 2 (Demo Service):", msg));

  srv.on("READ", Departments, async (req, next) => {
    await next();

    // return await SELECT.from(Departments);

    // if (!req.query.SELECT.columns)
    //    await next();

    // const expandIndex = req.query.SELECT.columns.findIndex(
    //    ({ expand, ref }) => expand && ref[0] === "employees"
    // );

    // if (expandIndex < 0) await next();

    // return await SELECT.from(Departments, (department) => {
    //    department.name,
    //       department.employees((employee) => {
    //          employee.name;
    //       });
    // });
  });

  srv.on("CREATE", Employees, async (req, next) => {
    await next();
  });

  srv.on("CREATE", Departments, async (req, next) => {
    await next();

    // let { name } = req.data;
    // let { ID } = uuidv4();
    // let entry = { ID, name };
    // await INSERT.into(Departments).entries(entry);

    // return entry;
  });

  //   cds.spawn({ user: privileged, every: 5000 }, async () => {
  //     console.log("Running scheduled task every 5 seconds...");
  //     await UPDATE(Employees).with({ experience: { "+=": 1 } });

  //     await srv.emit("some event", { foo: 11, bar: "12" });
  //   });

  srv.on("READ", BusinessPartners, async (req) => {
    req.query.where("LastName <> '' and FirstName <> '' ");
    try {
      const tx = S4HANAService.transaction(req);
      return await tx.send({
        query: req.query,
        headers: {
          apikey: process.env.apikey,
        },
      });
    } catch (err) {
      req.reject(err);
    }
  });

  srv.on("CREATE", Orders, async (req, next) => {

    const getNextNumber = async (db) => {
      let data = await db.run(`SELECT "ORDER_ID_SEQUENCE".NEXTVAL FROM DUMMY`);
      return data[0]["ORDER_ID_SEQUENCE.NEXTVAL"]
    }

    req.data.orderId = await getNextNumber(db);
    await next();
  });
};
