# UI5 MDC Tutorial
[![REUSE status](https://api.reuse.software/badge/github.com/SAP-samples/ui5-mdc-json-tutorial)](https://api.reuse.software/info/github.com/SAP-samples/ui5-mdc-json-tutorial)
## Description
In this tutorial, we will cover some key concepts involving metadata-driven controls (MDCs). This includes understanding control delegates, PropertyInfo, table, FilterBar, value help, TypeMap, and VariantManagement. The implementation will be based on a JSON model and is based on our official [Demokit Sample](https://sdk.openui5.org/entity/sap.ui.mdc/sample/sap.ui.mdc.demokit.sample.TableFilterBarJson). After completion, we should be able to leverage the full potential of the MDC concepts in our own projects.

>ℹ️ This version of the tutorial uses TypeScript. You can still find the JavaScript version [here](https://github.com/SAP-samples/ui5-mdc-json-tutorial/tree/javascript), but that one will not receive any more updates or additions. We recommend using sap.ui.mdc with TypeScript.
### Metadata-Driven Controls
Metadata-Driven Controls or MDCs are a powerful tool that allows us to create user interfaces dynamically at runtime. The controls are driven by metadata, which gives a description of the data and its characteristics. This way, we don't have to explicitly define every control in our UI, but we can configure and modify them based on the provided metadata. Find more details in the UI5 [Documentation](https://sdk.openui5.org/topic/1dd2aa91115d43409452a271d11be95b) and [API Reference](https://sdk.openui5.org/api/sap.ui.mdc).
### Delegates
Control Delegates are used to implement service or application-specific behavior for our MDCs. They allow developers to customize the default behavior of controls depending on the specific needs of their service or application. This can include things like custom control creation, metadata provision, or data binding.
### PropertyInfo
PropertyInfo is used to define the necessary metadata that should be provided to the controls. This can include information like the control visibility, the data type, or other control-specific settings. PropertyInfo is essential in letting our MDCs know how they should behave.
### Used Controls
These are some specific types of MDCs that we can use in our applications:
- **Table**: This control lets us display data in a tabular format. We can define columns and rows based on the provided metadata.
- **FilterBar**: This control provides a user interface for creating complex filter conditions. It can be used in conjunction with a Table control to filter the displayed data.
- **Value Help**: This control is used to assist the user in inputting data. It can provide suggestions or a list of possible values to choose from based on the provided metadata.
### Custom Types
The TypeMap is used for defining custom types in our MDCs. If the standard types provided are not sufficient for our needs, we can add our own using the TypeMap. This gives us even more flexibility in customizing our controls.
### VariantManagement and Personalization
VariantManagement is a feature that allows users to save their personalization settings. This can include things like the layout of a table, filter conditions in a FilterBar, or others. These settings can then be loaded later, allowing users to customize their experience and increase their productivity.
## Exercises
0. [Setup the Project on Your Machine](u1/ex0/) (*[browse sources](u1/ex0/webapp) - [run app](https://sap-samples.github.io/ui5-mdc-json-tutorial/u1/ex0/dist)*)
1. [How to Use the MDC Table](u1/ex1/) (*[browse sources](u1/ex1/webapp) - [run app](https://sap-samples.github.io/ui5-mdc-json-tutorial/u1/ex1/dist)*)
1. [How to Use the MDC FilterBar](u1/ex2/) (*[browse sources](u1/ex2/webapp) - [run app](https://sap-samples.github.io/ui5-mdc-json-tutorial/u1/ex2/dist)*)
1. [How to Build Advanced Value Helps](u1/ex3/) (*[browse sources](u1/ex3/webapp) - [run app](https://sap-samples.github.io/ui5-mdc-json-tutorial/u1/ex3/dist)*)
1. [How to Add Custom Types](u1/ex4/) (*[browse sources](u1/ex4/webapp) - [run app](https://sap-samples.github.io/ui5-mdc-json-tutorial/u1/ex4/dist)*)
1. [How to Enable VariantManagement](u1/ex5/) (*[browse sources](u1/ex5/webapp) - [run app](https://sap-samples.github.io/ui5-mdc-json-tutorial/u1/ex5/dist)*)
## Requirements
### Technical Requirements
* A current version of [Node.js](https://nodejs.org/) (preferably 18+)
* A code editor supporting TypeScript development
### Required Knowledge
* TypeScript knowledge to avoid blind copy and paste without knowing what's going on.
* UI5 knowledge, as this tutorial focuses on the MDC concepts.
## Known Issues
No known issues.
## How to obtain support
This repository is provided as-is, without any support guarantees. However, you are welcome to report issues via the [Issues](../../issues) tab and we'll see what we can do to fix them.
## Contributing
If you wish to contribute code, offer fixes or improvements, please send a pull request. Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).
## License
Copyright (c) 2023 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
