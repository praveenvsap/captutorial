namespace db;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Foo : cuid, managed {
    name : String
}

// using an external service from Northwind
using {NORTHWIND_SRV} from '../srv/external/NORTHWIND_SRV.csn';

entity Products as projection on NORTHWIND_SRV.Products {
    key ProductID,
        ProductName,
        QuantityPerUnit,
        UnitPrice,
        UnitsInStock
}
