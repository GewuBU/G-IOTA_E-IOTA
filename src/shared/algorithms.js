export const isTip = ({links, node}) => {
  return !links.some(link => node === link.target);
};

export const choose = arr => arr[Math.floor(Math.random() * arr.length)];


export const choose3 = ({nodes, links}) => nodes[calculateMiniConfidencePatchTips({nodes, links})];

export const getDescendants = ({nodes, links, root}) => {
  const stack = [root];
  const visitedNodes = new Set();
  const visitedLinks = new Set();

  while (stack.length > 0) {
    const current = stack.pop();

    const outgoingEdges = links.filter(l => l.source === current);
    for (let link of outgoingEdges) {
      visitedLinks.add(link);
      if (!visitedNodes.has(link.target)) {
        stack.push(link.target);
        visitedNodes.add(link.target);
      }
    }
  }

  return {nodes: visitedNodes, links: visitedLinks};
};

export const getAncestors = ({nodes, links, root}) => {
  const stack = [root];
  const visitedNodes = new Set();
  const visitedLinks = new Set();

  while (stack.length > 0) {
    const current = stack.pop();

    const incomingEdges = links.filter(l => l.target === current);
    for (let link of incomingEdges) {
      visitedLinks.add(link);
      if (!visitedNodes.has(link.source)) {
        stack.push(link.source);
        visitedNodes.add(link.source);
      }
    }
  }

  return {nodes: visitedNodes, links: visitedLinks};
};

export const getTips = ({nodes, links}) => {
  const tips = nodes.filter(node =>
    !links.some(link => link.target === node));

  return new Set(tips);
};

export const getDirectApprovers = ({links, node}) => {
  return links
    .filter(link => link.target === node)
    .map(link => link.source);
};

export const getChildren = ({links, node}) => {
  return links
    .filter(link => link.source === node)
    .map(link => link.target);
};

export const randomWalk = ({links, start}) => {
  let particle = start;
  const path = [start];

  while (!isTip({links, node: particle})) {
    const approvers = getDirectApprovers({links, node: particle});

    particle = choose(approvers);
    path.push(particle);
  }

  return {
    tip: particle,
    path,
  };
};

const weightedChoose = (arr, weights) => {
  const sum = weights.reduce((sum, w) => sum + w, 0);
  const rand = Math.random() * sum;

  let cumSum = weights[0];
  for (let i=1; i < arr.length; i++) {
    if (rand < cumSum) {
      return arr[i-1];
    }
    cumSum += weights[i];
  }

  return arr[arr.length-1];
};

export const weightedRandomWalk = ({nodes, links, start, alpha}) => {
  let particle = start;
  const path = [start];

  while (!isTip({links, node: particle})) {
    const approvers = getDirectApprovers({links, node: particle});

    const cumWeights = approvers.map(node => node.cumWeight);

    // normalize so maximum cumWeight is 0
    const maxWeight = Math.max(...cumWeights);
    const normalizedWeights = cumWeights.map(w => w - maxWeight);
    
    //Randomly for alpha value E-IOTA
    /*
    var rand = Math.random() * (100 - 0) + 0;
    var newAlpha;
    var p1 = 10;
    var p2 = 65;
    if (rand < p1) 
      newAlpha=0;
    else if(rand < p2)
      newAlpha=0.1; 
    else
      newAlpha = 5;
    const weights = normalizedWeights.map(w => Math.exp(newAlpha * w));
    */
    //Randomly for alpha value E-IOTA

    const weights = normalizedWeights.map(w => Math.exp(alpha * w));

    particle = weightedChoose(approvers, weights);
    path.push(particle);
  }

  return {
    tip: particle,
    path,
  };
};

const getChildrenLists = ({nodes, links}) => {
  // Initialize an empty list for each node
  const childrenLists = nodes.reduce((lists, node) =>
    Object.assign(lists, {[node.name]: []}), {});

  for (let link of links) {
    childrenLists[link.source.name].push(link.target);
  }

  return childrenLists;
};

// DFS-based topological sort
export const topologicalSort = ({nodes, links}) => {
  const childrenLists = getChildrenLists({nodes, links});
  const unvisited = new Set(nodes);
  const result = [];

  const visit = node => {
    if (!unvisited.has(node)) {
      return;
    }

    for (let child of childrenLists[node.name]) {
      visit(child);
    }

    unvisited.delete(node);
    result.push(node);
  };

  while (unvisited.size > 0) {
    const node = unvisited.values().next().value;

    visit(node);
  }

  result.reverse();
  return result;
};

export const calculateWeights = ({nodes, links}) => {
  const sorted = topologicalSort({nodes, links});

  // Initialize an empty set for each node
  const ancestorSets = nodes.reduce((lists, node) =>
    Object.assign(lists, {[node.name]: new Set()}), {});

  const childrenLists = getChildrenLists({nodes, links});
  for (let node of sorted) {
    for (let child of childrenLists[node.name]) {
      ancestorSets[child.name] = new Set([...ancestorSets[child.name], ...ancestorSets[node.name], node]);
    }

    node.cumWeight = ancestorSets[node.name].size + 1;
  }
};

export const calculateExitProbabilitiesUniform = ({nodes, links}) => {
  const tips = nodes.filter(node => isTip({links, node}));
  const tipProbabilty = 1.0 / tips.length;

  for (const tip of tips) {
    tip.exitProbability = tipProbabilty;
  }
};

export const calculateExitProbabilitiesUnweighted = ({nodes, links}) => {
  const sorted = topologicalSort({nodes, links});
  sorted.reverse();

  for (const node of sorted) {
    node.exitProbability = 0;
  }

  sorted[0].exitProbability = 1;
  for (const node of sorted) {
    const children = getChildren({links, node});
    for (const child of children) {
      const childApproverCount = getDirectApprovers({links, node: child}).length;
      node.exitProbability += child.exitProbability / childApproverCount;
    }
  }
};

export const calculateExitProbabilitiesWeighted = ({nodes, links, alpha}) => {
  const sorted = topologicalSort({nodes, links});
  sorted.reverse();

  for (const node of sorted) {
    node.exitProbability = 0;
  }

  sorted[0].exitProbability = 1;
  for (const node of sorted) {
    const children = getChildren({links, node});
    for (const child of children) {
      const approvers = getDirectApprovers({links, node: child});
      const cumWeights = approvers.map(n => n.cumWeight);

      // normalize so maximum cumWeight is 0
      const maxWeight = Math.max(...cumWeights);
      const normalizedWeights = cumWeights.map(w => w - maxWeight);
      const normalizedNodeCumWeight = node.cumWeight - maxWeight;

      const weights = normalizedWeights.map(w => Math.exp(alpha * w));
      const weightsSum = weights.reduce((a, b) => a + b, 0);
      const nodeWeight = Math.exp(alpha * normalizedNodeCumWeight);

      const chanceOfGettingPicked = nodeWeight / weightsSum;
      node.exitProbability += child.exitProbability * chanceOfGettingPicked;
    }
  }
};

export const calculateConfidence = ({nodes, links}) => {
  // Assumes exit probabilities are pre-calculated
  for (const node of nodes) {
    const approvingTips = Array.from(getAncestors({nodes, links, root: node}).nodes)
      .filter(ancestor => isTip({links, node: ancestor}));

    node.confidence = approvingTips
      .map(tip => tip.exitProbability)
      .reduce((a, b) => a + b, 0);
  }
};

//for G-IOTA
export const calculateMiniConfidencePatchTips = ({nodes, links}) => {
  // Assumes Confidence are pre-calculated
  const childrenLists = getChildrenLists({nodes, links});
  for (let children of childrenLists){
    children.filter(child => child.confidence < 1.0)
  }
  var rst = 2.0;
  var indi = -1;
  var sum = 0.0;
  for (let children of childrenLists){
    for (let i = 0;i<=children.length;i++){
      sum += children[i].confidence;
    }
    sum = sum / nodes.length
    if (sum < rst){
      rst = sum
      indi = children.name
    }
    sum = 0.0;
  }
  /*
  for (var q = 0;q<=childrenLists.length;q++){
    for(var i = 0;i<=childrenLists[q].length;i++){
      sum += nodes[i].confidence;
      }
    sum = sum / nodes.length
    if (sum < rst){
      rst = sum
      indi = q
    }
    sum = 0.0;
  }
  */
  return nodes.filter(node => node.name == indi);
};
//for G-IOTA