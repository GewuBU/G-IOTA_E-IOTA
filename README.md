# Iota Visual Simulation with G-IOTA and E-IOTA
@The original codes are from here : https://github.com/iotaledger/iotavisualization/tree/one-by-one. I made some modifications to show the features of G-IOTA (https://ieeexplore.ieee.org/document/8845163) and E-IOTA (https://ieeexplore.ieee.org/document/9223294).

This is a visualization aid for those interested in the Iota data structure, the _tangle_. It is written using React and D3.js.

## Setting up
After cloning the repo, run:
```
npm install
```
to download dependencies.

To run locally during development, use:
```
npm run dev-server
```

and go to `localhost:9000` in your browser.

## G-IOTA & E-IOTA
To run G-IOTA:
1) `Uncomment` line 48 in `./src/shared/tip-selection.js`.
2) Make sure lines from 117 to 129 are `commented` and line 132 is `uncommented` in `./src/shared/algorithms.js`.

To run E-IOTA ("alpha" is not available any more during the simulation):
1) Make sure line 48 is `commented` in `./src/shared/tip-selection.js`.
2) `Uncomment` lines from 117 to 129 and `Comment` line 132 in `./src/shared/algorithms.js`.
3) You can change de values of `p1` and `p2`, by defaut, `p1 = 10(%)` and `p2 = 65(%)`.

To run orignal tangle test:
1) Make sure line 48 is `commented` in `./src/shared/tip-selection.js`.
2) Make sure lines from 117 to 129 are `commented` and line 132 is `uncommented` in `./src/shared/algorithms.js`.

