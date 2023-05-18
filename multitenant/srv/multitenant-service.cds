using {db} from '../db/schema';
using {NORTHWIND_SRV} from './external/NORTHWIND_SRV';

@path : 'service/multitenant'
service multitenantService {
    entity Foo as select from db.Foo;

    @readonly
    entity Products as select from NORTHWIND_SRV.Products;
}
