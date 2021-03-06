//for G-IOTA
//import {calculateConfidence, calculateExitProbabilitiesWeighted} from './algorithms';
//for G-IOTA

const jStat = require('jStat').jStat;

export const generateTangle = ({nodeCount, lambda = 1.5, h=1, alpha=0.5, tipSelectionAlgorithm}) => {
  jStat.exponential.sample(lambda);
  const genesis = {
    name: '0',
    time: 0,
    paths: [],
  };

  let nodes = [genesis];
  let time = h;
  while (nodes.length < nodeCount) {
    const delay = jStat.exponential.sample(lambda);
    time += delay;
    nodes.push({
      name: `${nodes.length}`,
      time,
      x: 300,
      y: 200,
    });
  }

  const links = [];
  for (let node of nodes) {
    const candidates = nodes
      .filter(candidate => candidate.time < node.time - h);

    const candidateLinks = links
      .filter(link => link.source.time < node.time - h);

    const tips = tipSelectionAlgorithm({
      nodes: candidates,
      links: candidateLinks,
      alpha,
    });

    if (tips.length > 0) {
      links.push({source: node, target: tips[0].tip});
      node.paths = tips.map(tip => tip.path);

      if (tips.length > 1 && tips[0].tip.name !== tips[1].tip.name) {
        links.push({source: node, target: tips[1].tip});
      }
      ///*
      //for G-IOTA
      if (tips.length > 2 && tips[0].tip.name !== tips[2].tip.name && tips[1].tip.name !== tips[2].tip.name) {
        links.push({source: node, target: tips[2].tip});
      }
      //for G-IOTA
      //*/
    }
  };

  return {
    nodes,
    links,
  };
};
