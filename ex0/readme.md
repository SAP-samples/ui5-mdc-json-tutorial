[![solution](https://flat.badgen.net/badge/solution/available/green?icon=github)](webapp)
[![demo](https://flat.badgen.net/badge/demo/deployed/blue?icon=github)](https://sap-samples.github.io/ui5-mdc-json-tutorial/ex0/dist)
# Exercise 0: Setup the Project on Your Machine

This exercise will guide through the process of setting up a development environment. We will install Node.js, download and extract a zip file for a project, install project dependencies using npm, and serve the project using the UI5 tooling.

## Step 1: Install Node.js

If it is not alreaday available, the first step is to download and install it from https://nodejs.org/.

We can confirm the installation by opening our terminal or command prompt and typing:

```bash
node -v
```

This command should display the installed version of Node.js.

## Step 2: Download and Extract Project Files

Next, we will download the project files contained in a .zip file.

- Download the project files from [mdc.tutorial.zip](https://github.com/SAP-samples/ui5-mdc-json-tutorial/raw/ghpages/mdc.tutorial.zip).
- Once the download is complete, navigate to the download location and extract the .zip file.

## Step 3: Open the Project Folder

Now, we will open the project folder in our code editor.

- Navigate to the extracted project folder.
- Open the folder in our preferred code editor.

The structure should look like this:

![Alt text](ex0_folder.png)

## Step 4: Install Project Dependencies

Once the project is open in our code editor, we will install the project dependencies using npm, the Node Package Manager, which was installed alongside Node.js.

- Open a terminal or command prompt in our project's root directory.
- Run the following command:

```bash
npm install
```

This command will read the `package.json` file in our project and install the necessary dependencies.

## Step 5: Serve the Project

Finally, we will serve the project using ui5.

- In the terminal or command prompt at our project's root directory, run the following command:

```bash
ui5 serve
```

This command will start a development server for our project. Open the browser and check out the running application! 🚀

![Exercise 0 Result](ex0.png)

## Summary
Congratulations, we have successfully set up our development environment and served our project!

Continue to - [Exercise 1](../ex1/readme.md)