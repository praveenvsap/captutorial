namespace demo;

using {cuid} from '@sap/cds/common';

entity Employees : cuid {
    name       : String;
    experience : Integer default 0;
    department : Association to Departments;
}

entity Departments : cuid {
    name      : String;
    employees : Association to many Employees
                    on employees.department = $self;
}

entity Customers : cuid {
    name      : String;
}

// using an external service from S/4
using {  API_BUSINESS_PARTNER as external } from '../srv/external/API_BUSINESS_PARTNER.csn';

entity BusinessPartners as projection on external.A_BusinessPartner {
    key BusinessPartner,
    LastName,
    FirstName
}
