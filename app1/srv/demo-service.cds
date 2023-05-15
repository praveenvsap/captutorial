using {demo} from '../db/schema';

@path : 'service/demo'
service DemoService {

    entity Departments as select from demo.Departments;

    entity Employees as select from demo.Employees;

    entity Customers as select from demo.Customers;

    event demoEvent: {
        foo: Integer;
        bar: String;
    }

    @readonly
    entity BusinessPartners as projection on demo.BusinessPartners;
}
