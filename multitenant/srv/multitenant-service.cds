using {db} from '../db/schema';

@path : 'service/multitenant'
service multitenantService {
    entity Foo as select from db.Foo;
}
