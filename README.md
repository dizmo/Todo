# to-do dizmo

Create the `to-do` dizmo by running `npm run build` and drag and drop the generated file &ndash; which can be found under `build/to-do-x.y.z.dzm` &ndash; onto the *dizmoViewer* application.

## Building

> Before running any build script, please ensure that `npm install` has been executed, and that the dependencies beneath `node_modules` are up to date!

### Cleaning

Cleans the previous build (if any) by removing the `build/` folder completely:

```sh
npm run clean
```

### Building

Packages the dizmo as `build/to-do-x.y.z.dzm` by running all required build tasks and compressing the resulting dizmo as a ZIP archive (but with a `.dzm` extension). Runs also if required `npm install`:

```sh
npm run build
```

## Deploying

(Builds and) deploys the dizmo to the path specified by the `dizmo/deploy-path` entry (provided in `package.json` or `~/.generator-dizmo/config.json`) or specified by the `DZM_DEPLOY_PATH` environment variable. If neither are set, then the dizmo is only built, but not deployed:

```sh
npm run deploy
```

If any of the above steps fails &ndash; maybe due to missing dependencies &ndash; then please run `npm install` to have them fetched and installed locally!

## Watching

You may want to automatically build and deploy your dizmo, whenever a code change is applied. This is possible by running the `watch` run-script in a separate terminal:

```sh
npm run watch
```

Now, any change in the current directory (except in `build/` and `node_modules/`) will trigger a `deploy`, which is equivalent to manually running:

    npm run deploy

## Testing

By default *no* test cases *nor* a test framework are pre-defined:

```sh
npm run test
```

Runs tests (if any) &ndash; but actually the script simply returns an `exit 0` indicating a (dummy) success. If desired, integrate your test framework of choice, write your test cases and override the `test` script in `package.json` accordingly. The only requirement is that the main test script should return `0` in case of a successful test run.

## Documentation

Generates in the `docs/` folder documentation by using in-source comments:

```sh
npm run docs
```

## Configuration

The `dizmo` section in `package.json` can be extended with default values, which have to reside in `.generator-dizmo/config.json` (in *any* of the parent directories). For example:

```json
{
    "dizmo": {
        "deploy-path": ".."
    }
}
```

The configuration is hierarchical and recursive, i.e. that a `.generator-dizmo/config.json` file can be saved in *any* parent directory of the current project's path, all of which are then merged during the build dynamically into `package.json`. Configuration files in the lower levels have precedence.

## Upload

Dizmo offers a *dizmoStore*, where dizmos can be uploaded to: Besides `package.json` (or `.generator-dizmo/config.json`) or environment variables, upload arguments like the `host` and `user` name plus `pass`word can also be provided via the CLI:

```sh
npm run -- upload --host=https://store-api.dizmo.com --user='..' --pass='..'
```

## Versioning

**Important:** Please use semantic versioning by applying `npm version patch` for small *patches*, `npm version minor` for *minor* and `npm version major` for *major* changes! See NPM's [semantic versioning](https://docs.npmjs.com/getting-started/semantic-versioning) documentation for further information.
