"use strict";sap.ui.define(["sap/ui/mdc/FilterBarDelegate","mdc/tutorial/model/metadata/JSONPropertyInfo","sap/ui/mdc/FilterField","sap/ui/core/Element"],function(e,t,n,a){"use strict";function i(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const d=i(t);var r=Object.assign({},e);r.fetchProperties=async()=>d;const s=(e,t,a)=>{const i=t.key;const d=new n(e,{dataType:t.dataType,conditions:`{$filters>/conditions/${i}}`,propertyKey:i,required:t.required,label:t.label,maxConditions:t.maxConditions,delegate:{name:"sap/ui/mdc/field/FieldBaseDelegate",payload:{}}});return d};r.addItem=async(e,t)=>{const n=d.find(e=>e.key===t);const i=`${e.getId()}--filter--${t}`;const r=a.getElementById(i);return r??s(i,n,e)};return r});
//# sourceMappingURL=JSONFilterBarDelegate.js.map