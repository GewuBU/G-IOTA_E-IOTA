import {choose, choose3, isTip, randomWalk, weightedRandomWalk, calculateWeights, calculateConfidence, calculateExitProbabilitiesWeighted, calculateMiniConfidencePatchTips} from './algorithms';

export const uniformRandom = ({nodes, links}) => {
  const candidates = nodes.filter(node => isTip({links, node}));

  return candidates.length === 0 ? [] : [
    {tip: choose(candidates), path: []},
    {tip: choose(candidates), path: []}];
};

export const unWeightedMCMC = ({nodes, links}) => {
  if (nodes.length === 0) {
    return [];
  }

  const start = nodes[0]; // Start in genesis

  return [
    randomWalk({links, start}),
    randomWalk({links, start}),
  ];
};

export const weightedMCMC = ({nodes, links, alpha}) => {
  if (nodes.length === 0) {
    return [];
  }

  const start = nodes[0]; // Start in genesis

  const candidates = nodes.filter(node => isTip({links, node}) && node.time < (nodes[nodes.length-1].time - 4));
  var minii = nodes[nodes.length-1].time;
  for (const node of candidates){
    if (node.time < minii)
      minii = node.time
  }
  const candidateOnly = nodes.filter(node => isTip({links, node}) && node.time <= minii+1);
 
  //for G-IOTA
  calculateWeights({nodes, links});

  //for G-IOTA
  if (candidateOnly.length > 0){
    return [
      weightedRandomWalk({links, start, alpha}),
      weightedRandomWalk({links, start, alpha}),
      //for G-IOTA
      //{tip: choose(candidateOnly), path: []}
    ];
  }
  else{
    return [
      weightedRandomWalk({links, start, alpha}),
      weightedRandomWalk({links, start, alpha}),
    ];
  }
};
