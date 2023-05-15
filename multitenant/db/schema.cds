namespace db;

using {
    cuid,
    managed
} from '@sap/cds/common';

entity Foo : cuid, managed {
    name : String
}
