@cds.persistence.exists
@readonly
entity DEMO_CUSTOMERS {
    key ID   : String(36) not null;
        NAME : String(5000);
}
