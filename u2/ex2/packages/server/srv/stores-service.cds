using { sap.ui5.stores as my } from '../db/schema';

service StoresService {
  @odata.draft.enabled
  entity Stores as projection on my.Store;
  entity Inventory as projection on my.Inventory;

  @readonly
  entity Transfers as projection on my.Transfer;
  @readonly
  entity TransferItems as projection on my.TransferItem;
}
