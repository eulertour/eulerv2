# eulerv2

### Developing javascript:

Install dependencies: `yarn install`

Run development server: `yarn run serve`

Compile production build: `yarn run build`

Run tests: `yarn run test`

Lint and fix files: `yarn run lint`

To customize the configuration, see the [Configuration Reference](https://cli.vuejs.org/config/).

### Developing python:
Before developing python, you'll have to clone [eulertour/pyodide](https://github.com/eulertour/pyodide) and [eulertour/manim](https://github.com/eulertour/manim) into `dev/`. There is a setup script written for python 3.7 (`dev/initial_setup.py`) which can do this for you.

You'll then have to build pyodide. The easiest way to do this is via docker. The pyodide repo has a shell script (`run_docker`) which will download the image if necessary and give you a shell in the container. From there you can run `make` to start the build. There's more info on building pyodide with docker [here](https://github.com/eulertour/pyodide#using-docker).

Once pyodide has been built, you can build (web)manim from the same docker container by running `build_manimlib.sh` (you may have to run it twice). The script will place a `manimlib.js` and `manimlib.data` file in the `build/` directory in the pyodide repo. You'll have to copy these into the `public/pyodide/` directory in the eulerv2 directory in order to see the changes in the web app.
