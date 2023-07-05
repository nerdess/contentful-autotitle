Simple boilerplate implementation of the Lexical editor for Contentful. Lexical is a new and hightly customisable WYSIWYG. Find our more about Lexical and check out the playground here: [Lexical](https://lexical.dev/).

This project was bootstrapped with [Create Contentful App](https://github.com/contentful/create-contentful-app).

## How to use

First, clone, install and build this repository.

```bash
# npm
npm install
npm run build

# Yarn
yarn install
yarn run build
```

Then, go to `Apps > Custom Apps > Manage Apps Definition > Create app` in your Contentful CMS. Give the app a name and enable `Frontend: Hosted by Contentful`. Here, you drag and drop the build folder that you just created. Define where the editor should be located (e.g. Entry field: Short text, Long text) and hit save! Done 🥳

This is how the editor should look like in your Contentful CMS:

![Lexical in Contentful](https://raw.githubusercontent.com/nerdess/contentful-lexical/main/public/images/lexical.png?token=GHSAT0AAAAAACBCKJ6YJIIMMYBF6SUEVYVMZCWJDCQ)

## Extend/Modify

Please refer to the [Lexical Documentation](https://lexical.dev/) on how to extend/modify this boilerplate. Lexical also has a helpful [community](https://lexical.dev/community). 

## Todo

This is just a first (but working!) proof-of-concept. I need to cleanup the code a bit, write some tests and all that stuff 🙈