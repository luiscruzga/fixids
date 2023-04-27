
# FIX-IDS

This small module allows you to add ids to all those html elements that do not have this attribute of those .html files that are in a given folder

## Installation

Install this module with npm

```javascript
npm i -g fixids
```

## Usage

Once the module is installed, from the project folder you want to "fix", you must execute the command: fixids, it will automatically request two parameters per screen: the directory to fix and the length of the ids to generate

![WABOT](https://github.com/luiscruzga/fixids/blob/main/fixids.png?raw=true)

You can use a .env.local file in your repository directory to be able to indicate the parameters with which to run:

```javascript
FIX_DIRECTORY=src
FIX_LARGE_ID=12
FIX_ALLOWED_TAGS=button, a, li
FIX_EXCLUDED_TAGS=
```
