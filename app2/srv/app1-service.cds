using {DEMO_CUSTOMERS} from '../db/app1_schema';


@path: 'service/app1'
service App1Service {

    @readonly
    entity Customers as projection on DEMO_CUSTOMERS;

}
