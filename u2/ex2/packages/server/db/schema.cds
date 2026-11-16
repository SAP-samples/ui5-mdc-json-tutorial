namespace sap.ui5.stores;
using { managed, cuid } from '@sap/cds/common';

entity Store : managed {
  key ID        : UUID;
  name          : String(200);
  address       : String(300);
  city          : String(100);
  country       : String(100);
  latitude      : Decimal(10,7);
  longitude     : Decimal(10,7);
  phone         : String(30);
  openingHours  : String(100);
  inventory     : Composition of many Inventory on inventory.store = $self;
}

entity Inventory : cuid, managed {
  store         : Association to Store;
  name          : String(200);
  category      : String(50);
  type          : String(50);
  size          : String(10);
  color         : String(50);
  quantity      : Integer;
}

entity Transfer : cuid, managed {
  sourceStore   : Association to Store;
  destStore     : Association to Store;
  transferDate  : String(10);
  distance      : Decimal(8,1);
  co2Emissions  : Decimal(8,2);
  status        : String(20);
  items         : Composition of many TransferItem on items.transfer = $self;
}

entity TransferItem : cuid {
  transfer      : Association to Transfer;
  name          : String(200);
  category      : String(50);
  type          : String(50);
  size          : String(10);
  color         : String(50);
  quantity      : Integer;
}
