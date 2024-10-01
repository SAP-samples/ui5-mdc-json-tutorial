//@ui5-bundle mdc/tutorial/Component-preload.js
sap.ui.require.preload({
	"mdc/tutorial/Component.js":function(){
"use strict";sap.ui.define(["sap/ui/core/UIComponent"],function(t){"use strict";const e=t.extend("mdc.tutorial.Component",{});return e});
},
	"mdc/tutorial/delegate/JSONBaseDelegate.js":function(){
"use strict";sap.ui.define(["mdc/tutorial/model/type/TypeMap"],function(e){"use strict";function t(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const u=t(e);var n={getTypeMap:function(){return u}};return n});
},
	"mdc/tutorial/delegate/JSONFilterBarDelegate.js":function(){
"use strict";sap.ui.define(["sap/ui/mdc/FilterBarDelegate","mdc/tutorial/model/metadata/JSONPropertyInfo","sap/ui/mdc/FilterField","sap/ui/core/Element","sap/ui/core/Fragment","./JSONBaseDelegate"],function(e,t,a,n,d,i){"use strict";function s(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const o=s(t);const l=s(i);var r=Object.assign({},e,l);r.fetchProperties=async()=>o;const c=async(e,t)=>{const a="mdc.tutorial.view.fragment.";const n=await d.load({name:a+e.getPayload().valueHelp[t]});e.addDependent(n);return n};const u=async(e,t,n)=>{const d=t.key;const i=new a(e,{dataType:t.dataType,conditions:`{$filters>/conditions/${d}}`,propertyKey:d,required:t.required,label:t.label,maxConditions:t.maxConditions,delegate:{name:"sap/ui/mdc/field/FieldBaseDelegate",payload:{}}});if(n.getPayload().valueHelp[d]){const e=n.getDependents();let t=e.find(e=>e.getId().includes(d));t??=await c(n,d);i.setValueHelp(t)}return i};r.addItem=async(e,t)=>{const a=o.find(e=>e.key===t);const d=`${e.getId()}--filter--${t}`;const i=n.getElementById(d);return i??u(d,a,e)};return r});
},
	"mdc/tutorial/delegate/JSONTableDelegate.js":function(){
"use strict";sap.ui.define(["sap/ui/mdc/TableDelegate","sap/m/Text","sap/ui/core/Element","mdc/tutorial/model/metadata/JSONPropertyInfo","sap/ui/mdc/table/Column","sap/ui/model/Filter","sap/ui/model/FilterOperator","./JSONBaseDelegate"],function(e,t,a,n,r,s,o,l){"use strict";function c(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const i=c(n);const d=c(l);const u=Object.assign({},e,d);u.fetchProperties=async()=>i.filter(e=>e.key!=="$search");const p=(e,n)=>{const s=e.key;const o=n.getId()+"---col-"+s;const l=a.getElementById(o);return l??new r(o,{propertyKey:s,header:e.label,template:new t({text:{path:"mountains>"+s,type:e.dataType}})})};u.addItem=async(e,t)=>{const a=i.find(e=>e.key===t);return p(a,e)};u.updateBindingInfo=(t,a)=>{e.updateBindingInfo.call(u,t,a);a.path=t.getPayload().bindingPath;a.templateShareable=true};const m=(e,t)=>{const a=t.map(t=>new s({path:t,operator:o.Contains,value1:e}));return[new s(a,false)]};u.getFilters=t=>{const n=a.getElementById(t.getFilter()).getSearch();const r=t.getPayload().searchKeys;let s=e.getFilters(t);if(n&&r){s=s.concat(m(n,r))}return s};return u});
},
	"mdc/tutorial/manifest.json":'{"sap.app":{"id":"mdc.tutorial","type":"application","applicationVersion":{"version":"1.0.0"},"title":"MDC JSON Tutorial","description":"MDC JSON Tutorial featuring Table and Filterbar with VM","dataSources":{"mountains":{"uri":"model/mountains.json","type":"JSON"}}},"sap.ui":{"technology":"UI5","deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"flexEnabled":false,"dependencies":{"minUI5Version":"1.118.0","libs":{"sap.ui.core":{},"sap.m":{},"sap.f":{},"sap.ui.mdc":{},"sap.ui.fl":{}}},"contentDensities":{"compact":true,"cozy":true},"handleValidation":true,"models":{"mountains":{"type":"sap.ui.model.json.JSONModel","dataSource":"mountains"}},"rootView":{"viewName":"mdc.tutorial.view.Mountains","type":"XML","async":true,"id":"sample"}}}',
	"mdc/tutorial/model/metadata/JSONPropertyInfo.js":function(){
"use strict";sap.ui.define([],function(){"use strict";var e=[{key:"rank",label:"Rank",visible:true,path:"rank",dataType:"sap.ui.model.type.Integer"},{key:"name",label:"Name",visible:true,path:"name",dataType:"sap.ui.model.type.String"},{key:"height",label:"Height",visible:true,path:"height",dataType:"sap.ui.model.type.Integer"},{key:"prominence",label:"Prominence",visible:true,path:"prominence",dataType:"sap.ui.model.type.Integer"},{key:"range",label:"Range",visible:true,path:"range",dataType:"sap.ui.model.type.String"},{key:"coordinates",label:"Coordinates",visible:true,path:"coordinates",dataType:"sap.ui.model.type.String"},{key:"parent_mountain",label:"Parent Mountain",visible:true,path:"parent_mountain",dataType:"sap.ui.model.type.String"},{key:"first_ascent",label:"First Ascent",visible:true,path:"first_ascent",dataType:"sap.ui.model.type.Integer"},{key:"countries",label:"Countries",visible:true,path:"countries",dataType:"sap.ui.model.type.String"},{key:"$search",label:"Search",visible:true,maxConditions:1,dataType:"sap.ui.model.type.String"}];return e});
},
	"mdc/tutorial/model/type/LengthMeter.js":function(){
"use strict";sap.ui.define(["sap/ui/model/type/Integer","sap/ui/core/format/NumberFormat"],function(e,t){"use strict";class r extends e{formatValue(e){const r=t.getUnitInstance();return r.format(e,"length-meter")}}return r});
},
	"mdc/tutorial/model/type/TypeMap.js":function(){
"use strict";sap.ui.define(["sap/ui/mdc/DefaultTypeMap","sap/ui/mdc/enums/BaseType"],function(e,t){"use strict";const s=Object.assign({},e);s.import(e);s.set("mdc.tutorial.model.type.LengthMeter",t.Numeric);s.freeze();return s});
},
	"mdc/tutorial/view/Mountains.view.xml":'<mvc:View\n\theight="100%"\n\tdisplayBlock="true"\n\txmlns="sap.m"\n\txmlns:mvc="sap.ui.core.mvc"\n\txmlns:f="sap.f"\n\txmlns:core="sap.ui.core"\n\txmlns:mdc="sap.ui.mdc"\n\txmlns:mdct="sap.ui.mdc.table"\n\txmlns:vm="sap.ui.fl.variants"><f:DynamicPage id="page"><f:title><f:DynamicPageTitle><f:heading><vm:VariantManagement id="variants" for="filterbar, table"/></f:heading></f:DynamicPageTitle></f:title><f:header><f:DynamicPageHeader pinnable="true"><mdc:FilterBar id="filterbar" delegate="{\n\t\t\t\t\t\t\tname: \'mdc/tutorial/delegate/JSONFilterBarDelegate\',\n\t\t\t\t\t\t\tpayload: {\n\t\t\t\t\t\t\t\tvalueHelp: {\n\t\t\t\t\t\t\t\t\tname: \'NameValueHelp\',\n\t\t\t\t\t\t\t\t\trange: \'RangeValueHelp\'\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}"\n\t\t\t\t\t\tp13nMode = "Item,Value"><mdc:basicSearchField><mdc:FilterField delegate="{name: \'sap/ui/mdc/field/FieldBaseDelegate\'}"\n\t\t\t\t\t\t\tdataType="sap.ui.model.type.String"\n\t\t\t\t\t\t\tplaceholder= "Search Mountains"\n\t\t\t\t\t\t\tconditions="{$filters>/conditions/$search}"\n\t\t\t\t\t\t\tmaxConditions="1"/></mdc:basicSearchField><mdc:filterItems><mdc:FilterField\n\t\t\t\t\t\t\tlabel="Name"\n\t\t\t\t\t\t\tpropertyKey="name"\n\t\t\t\t\t\t\tdataType="sap.ui.model.type.String"\n\t\t\t\t\t\t\tconditions="{$filters>/conditions/name}"\n\t\t\t\t\t\t\tvalueHelp="name-vh"\n\t\t\t\t\t\t\tdelegate="{name: \'sap/ui/mdc/field/FieldBaseDelegate\'}"/></mdc:filterItems><mdc:dependents><core:Fragment fragmentName="mdc.tutorial.view.fragment.NameValueHelp" type="XML"/></mdc:dependents></mdc:FilterBar></f:DynamicPageHeader></f:header><f:content><mdc:Table\n\t\t\t\tid="table"\n\t\t\t\theader="Mountains"\n\t\t\t\tp13nMode="Sort,Column"\n\t\t\t\ttype="ResponsiveTable"\n\t\t\t\tthreshold="100"\n\t\t\t\tfilter="filterbar"\n\t\t\t\tshowRowCount="false"\n\t\t\t\tdelegate="{\n\t\t\t\t\tname: \'mdc/tutorial/delegate/JSONTableDelegate\',\n\t\t\t\t\tpayload: {\n\t\t\t\t\t\tbindingPath: \'mountains>/mountains\',\n\t\t\t\t\t\tsearchKeys: [\'name\', \'range\', \'parent_mountain\', \'countries\']\n\t\t\t\t\t}\n\t\t\t\t}"><mdct:Column\n\t\t\t\t\tpropertyKey="name"\n\t\t\t\t\theader="Name"><Text text="{mountains>name}"/></mdct:Column><mdct:Column\n\t\t\t\t\tpropertyKey="height"\n\t\t\t\t\theader="Height"><Text text="{path: \'mountains>height\' , type: \'mdc.tutorial.model.type.LengthMeter\'}"/></mdct:Column><mdct:Column\n\t\t\t\t\tpropertyKey="range"\n\t\t\t\t\theader="Range"><Text text="{mountains>range}"/></mdct:Column><mdct:Column\n\t\t\t\t\tpropertyKey="first_ascent"\n\t\t\t\t\theader="First Ascent"><Text text="{mountains>first_ascent}"/></mdct:Column><mdct:Column\n\t\t\t\t\tpropertyKey="countries"\n\t\t\t\t\theader="Countries"><Text text="{mountains>countries}"/></mdct:Column><mdct:Column\n\t\t\t\t\tpropertyKey="parent_mountain"\n\t\t\t\t\theader="Parent Mountain"><Text text="{mountains>parent_mountain}"/></mdct:Column></mdc:Table></f:content></f:DynamicPage></mvc:View>',
	"mdc/tutorial/view/fragment/NameValueHelp.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:mdc="sap.ui.mdc"\n\txmlns:vh="sap.ui.mdc.valuehelp"\n\txmlns:vhc="sap.ui.mdc.valuehelp.content"\n\txmlns:vhfb="sap.ui.mdc.filterbar.vh"><mdc:ValueHelp id="name-vh" delegate="{name: \'sap/ui/mdc/ValueHelpDelegate\', payload: {}}"><mdc:typeahead><vh:Popover title="Name"><vhc:MTable keyPath="name" filterFields="*name*"><Table id="name-vht-table" items=\'{path : "mountains>/mountains", length: 10}\'\n\t\t\t\t\t\twidth="30rem"><columns><Column><header><Text text="Name" /></header></Column></columns><items><ColumnListItem type="Active"><cells><Text text="{mountains>name}" /></cells></ColumnListItem></items></Table></vhc:MTable></vh:Popover></mdc:typeahead><mdc:dialog><vh:Dialog title="Name"><vhc:MDCTable keyPath="name"><vhc:filterBar><vhfb:FilterBar id="name-vhd-fb" delegate="{name: \'mdc/tutorial/delegate/JSONFilterBarDelegate\'}"><vhfb:basicSearchField><mdc:FilterField delegate="{name: \'sap/ui/mdc/field/FieldBaseDelegate\'}"\n\t\t\t\t\t\t\t\t\tdataType="sap.ui.model.type.String"\n\t\t\t\t\t\t\t\t\tplaceholder= "Search Mountains"\n\t\t\t\t\t\t\t\t\tconditions="{$filters>/conditions/$search}"\n\t\t\t\t\t\t\t\t\tmaxConditions="1"/></vhfb:basicSearchField></vhfb:FilterBar></vhc:filterBar><mdc:Table id="name-vhd-table"\n\t\t\t\t\t\ttype="ResponsiveTable"\n\t\t\t\t\t\tselectionMode="Multi"\n\t\t\t\t\t\tdelegate="{\n\t\t\t\t\t\t\tname: \'mdc/tutorial/delegate/JSONTableDelegate\',\n\t\t\t\t\t\t\tpayload: {\n\t\t\t\t\t\t\t\tbindingPath: \'mountains>/mountains\'\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}"\n\t\t\t\t\t\tfilter="name-vhd-fb"><mdc:columns><mdc:table.Column\n\t\t\t\t\t\t\t\theader="Name"\n\t\t\t\t\t\t\t\tdataProperty="name"><Text text="{mountains>name}"/></mdc:table.Column></mdc:columns></mdc:Table></vhc:MDCTable><vhc:Conditions label="Name"/></vh:Dialog></mdc:dialog></mdc:ValueHelp></core:FragmentDefinition>',
	"mdc/tutorial/view/fragment/RangeValueHelp.fragment.xml":'<core:FragmentDefinition\n\txmlns="sap.m"\n\txmlns:core="sap.ui.core"\n\txmlns:mdc="sap.ui.mdc"\n\txmlns:vh="sap.ui.mdc.valuehelp"\n\txmlns:vhc="sap.ui.mdc.valuehelp.content"\n\txmlns:vhfb="sap.ui.mdc.filterbar.vh"><mdc:ValueHelp id="range-vh" delegate="{name: \'sap/ui/mdc/ValueHelpDelegate\', payload: {}}"><mdc:typeahead><vh:Popover title="Range"><vhc:MTable keyPath="range" filterFields="*range*"><Table id="range-vh-table" items=\'{path : "mountains>/ranges"}\' width="30rem"><columns><Column><header><Text text="Range" /></header></Column></columns><items><ColumnListItem type="Active"><cells><Text text="{mountains>range}" /></cells></ColumnListItem></items></Table></vhc:MTable></vh:Popover></mdc:typeahead></mdc:ValueHelp></core:FragmentDefinition>'
});
//# sourceMappingURL=Component-preload.js.map