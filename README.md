Simple Contentful App to automatically generate an entry title from one or more entry fields.

This project was bootstrapped with [Create Contentful App](https://github.com/contentful/create-contentful-app).

![Example Entry](https://raw.githubusercontent.com/nerdess/contentful-autotitle/main/public/images/entry.png)

## How to install

First, clone, install and build this repository.

```bash
# npm
npm install
npm run build

# Yarn
yarn install
yarn run build
```

1. Go to `Apps > Custom Apps > Manage Apps Definition > Create app` in your Contentful CMS. Give the app a name (e.g. `Auto title`) and enable `Frontend: Hosted by Contentful`. 

2. Drag and drop the build folder you created before to where it says `To upload, drag and drop your app output folder here`

3. Define where the editor should be located which would be `Entry Field > Short text" and/or "Entry Field > Short text, list`

4. At the bottom, click `Add instance parameter definition` and add add the following new parameter:

    ![Field-Ids](https://raw.githubusercontent.com/nerdess/contentful-autotitle/main/public/images/fieldIds.png)

    ...hit save! 

5. `Go to Apps > Custom apps`, find the app you just created and install it.

Done 🥳

## How to use

Each content type in your content model needs an entry title. To make use of the extension and autmatically generate that title you need to edit the entry title of a content type. 

1. Go to `Content model` and select the content type you want to edit or create a new one.

2. Edit the `Entry title` field and click on `Appearance`. Select the custom extension and add some Field-Ids. These fields will be used to automatically generate the title.

3. Save and start editing your content!

## Todo

This is just a first (but working!) proof-of-concept. I need to cleanup the code a bit, write some tests and all that stuff 🙈