# Ethereum Name Service Registrar DApp

How to run it:

    cd app
    meteor npm install
    meteor


### Deploying to github pages

A static copy of the app is kept at [ethereum.github.io/ens-registrar-dapp](https://ethereum.github.io/ens-registrar-dapp/). The page reflects whatever is kept at the `docs` folder in the `master` branch. So to update the static site, create a working branch and execute these:

```
cd app
meteor-build-client ../docs --path ""
cd ..
git add .
```

Then commit all and make a Pull Request to master.
