const debug = require("debug")("srv:provisioning");
const cfenv = require("cfenv");
const appEnv = cfenv.getAppEnv();
const xsenv = require("@sap/xsenv");
xsenv.loadEnv();
const services = xsenv.getServices({
  registry: { tag: "SaaS" },
  dest: { tag: "destination" },
});

const core = require("@sap-cloud-sdk/core");

let organizationId = appEnv.app.organization_id;
let spaceId = appEnv.app.space_id;
let spaceName = appEnv.app.space_name.toLowerCase().replace(/_/g, "-");
let appName = services.registry.appName;
let modifiedAppName = services.registry.appName
  .toLowerCase()
  .replace(/_/g, "-");

const getCFInfo = async (appName) => {
  try {
    // get app GUID
    let res1 = await core.executeHttpRequest(
      { destinationName: "multitenant-cfapi" },
      {
        method: "GET",
        url: `/v3/apps?organization_guids=${organizationId}&space_guids=${spaceId}&names=${appName}`,
      }
    );

    // get domain GUID
    let res2 = await core.executeHttpRequest(
      { destinationName: "multitenant-cfapi" },
      {
        method: "GET",
        url: `/v3/domains?names=${
          /\.(.*)/gm.exec(appEnv.app.application_uris[0])[1]
        }`,
      }
    );
    let results = {
      app_id: res1.data.resources[0].guid,
      domain_id: res2.data.resources[0].guid,
    };
    return results;
  } catch (err) {
    console.log(err.stack);
    return err.message;
  }
};

const createRoute = async (tenantHost, appName) => {
  try {
    let CFInfo = await getCFInfo(appName);

    // create route
    let res1 = await core.executeHttpRequest(
      { destinationName: "multitenant-cfapi" },
      {
        method: "POST",
        url: "/v3/routes",
        data: {
          host: tenantHost,
          relationships: {
            space: {
              data: {
                guid: spaceId,
              },
            },
            domain: {
              data: {
                guid: CFInfo.domain_id,
              },
            },
          },
        },
      }
    );

    // map route to app
    let res2 = await core.executeHttpRequest(
      { destinationName: "multitenant-cfapi" },
      {
        method: "POST",
        url: `/v3/routes/${res1.data.guid}/destinations`,
        data: {
          destinations: [
            {
              app: {
                guid: CFInfo.app_id,
              },
            },
          ],
        },
      }
    );

    console.log(`Route created for ${tenantHost}`);
    return res2.data;
  } catch (err) {
    console.log(err.stack);
    return err.message;
  }
};

const deleteRoute = async (tenantHost, appName) => {
  try {
    let CFInfo = await getCFInfo(appName);

    // get route id
    let res1 = await core.executeHttpRequest(
      { destinationName: "multitenant-cfapi" },
      {
        method: "GET",
        url: `/v3/apps/${CFInfo.app_id}/routes?hosts=${tenantHost}`,
      }
    );

    if (res1.data.pagination.total_results === 1) {
      try {
        // delete route
        let res2 = await core.executeHttpRequest(
          { destinationName: "multitenant-cfapi" },
          {
            method: "DELETE",
            url: "/v3/routes/" + res1.data.resources[0].guid,
          }
        );
        console.log("Route deleted for " + tenantHost);
        return res2.data;
      } catch (err) {
        console.log(err.stack);
        return err.message;
      }
    } else {
      let errmsg = { error: "Route not found" };
      console.log(errmsg);
      return errmsg;
    }
  } catch (err) {
    console.log(err.stack);
    return err.message;
  }
};

module.exports = (service) => {
  service.on("UPDATE", "tenant", async (req, next) => {
    let subscribedSubdomain = req.data.subscribedSubdomain;
    let subscribedTenantId = req.data.subscribedTenantId;

    let tenantHost = `${subscribedSubdomain}-${spaceName}-${modifiedAppName}`;

    let tenantURL = `https://${tenantHost}${
      /\.(.*)/gm.exec(appEnv.app.application_uris[0])[0]
    }`;

    console.log(
      "Subscribe: ",
      subscribedSubdomain,
      subscribedTenantId,
      tenantHost
    );
    await next();

    try {
      await createRoute(tenantHost, appName);
      console.log(
        "Subscribe: - Create Route: ",
        subscribedTenantId,
        tenantHost,
        tenantURL
      );

      return tenantURL;
    } catch (err) {
      debug(err.stack);
      return "";
    }
  });

  service.on("DELETE", "tenant", async (req, next) => {
    let subscribedSubdomain = req.data.subscribedSubdomain;
    let subscribedTenantId = req.data.subscribedTenantId;

    let tenantHost = `${subscribedSubdomain}-${spaceName}-${modifiedAppName}`;

    console.log(
      "Unsubscribe: ",
      subscribedSubdomain,
      subscribedTenantId,
      tenantHost
    );
    await next();

    try {
      await deleteRoute(tenantHost, appName);
      console.log("Unsubscribe: - Delete Route: ", subscribedTenantId);

      return subscribedTenantId;
    } catch (err) {
      debug(err.stack);
      return "";
    }
  });

  service.on("upgradeTenant", async (req, next) => {
    await next();
    const { instanceData, deploymentOptions } = cds.context.req.body;
    console.log(
      "UpgradeTenant: ",
      req.data.subscribedTenantId,
      req.data.subscribedSubdomain,
      instanceData,
      deploymentOptions
    );
  });

  service.on("dependencies", async (req) => {
    let dependencies = [
      {
        xsappname: services.dest.xsappname,
      },
    ];
    console.log("Dependencies: ", dependencies);
    return dependencies;
  });
};
