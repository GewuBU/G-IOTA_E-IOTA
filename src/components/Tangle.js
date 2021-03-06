import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip';
import * as d3Scale from 'd3-scale';

const Axis = ({x, endX, y, startVal, endVal, ticks}) => {
  const tickSize = 5;

  const xScale = d3Scale.scaleLinear().domain([startVal, endVal]);
  xScale.range([x, endX]);
  const tickValues = xScale.ticks(ticks);

  return (
    <g fill='none' className='unselectable axis'>
      <text
        x={(x+endX)/2}
        y={y - tickSize}>
        Time
      </text>
      <line
        stroke='#000'
        strokeWidth='1'
        x1={x}
        x2={endX}
        y1={y}
        y2={y} />
      {tickValues.map(value =>
        <line
          key={value}
          stroke='#000'
          strokeWidth='2'
          x1={xScale(value)}
          y1={y}
          x2={xScale(value)}
          y2={y + tickSize} />
      )}
      {tickValues.map(value =>
        <text
          key={value}
          fontSize='12'
          x={xScale(value)}
          y={y + 3.2 * tickSize}>
          {value}
        </text>
      )}
    </g>
  );
};

Axis.propTypes = {
  x: PropTypes.number.isRequired,
  endX: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  startVal: PropTypes.number.isRequired,
  endVal: PropTypes.number.isRequired,
  ticks: PropTypes.number.isRequired,
};

const Marker = ({color, id, nodeRadius}) =>
  <marker
    id={id}
    viewBox='0 -5 10 10'
    refX={0}
    refY={0}
    markerWidth={10}
    markerHeight={6}
    fill={color}
    markerUnits='userSpaceOnUse'
    orient='auto' >
    <path d='M0,-5L10,0L0,5'/>
  </marker>;

Marker.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  nodeRadius: PropTypes.number.isRequired,
};

const Node = ({nodeRadius, mouseEntersNodeHandler, mouseLeavesNodeHandler, name,
  stroke='black', strokeWidth='1px', fill='white', style, className}) =>
  <rect width={nodeRadius} height={nodeRadius}
    x={-nodeRadius/2}
    y={-nodeRadius/2}
    rx={nodeRadius/5}
    ry={nodeRadius/5}
    stroke={stroke}
    strokeWidth={strokeWidth}
    fill={fill}
    name={name}
    style={style}
    className={className}
    onMouseEnter={mouseEntersNodeHandler}
    onMouseLeave={mouseLeavesNodeHandler} >
  </rect>;

Node.propTypes = {
  nodeRadius: PropTypes.number.isRequired,
  mouseEntersNodeHandler: PropTypes.any,
  mouseLeavesNodeHandler: PropTypes.any,
  name: PropTypes.string,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.string,
  fill: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
};

const generateLinkPath = ({link, nodeRadius}) => {
  const arrowheadSpace = nodeRadius;

  const pathVector = {
    x: link.target.x - link.source.x,
    y: link.target.y - link.source.y,
  };
  const radius = Math.sqrt(Math.pow(pathVector.x, 2) + Math.pow(pathVector.y, 2));

  const scalingFactor = (radius - arrowheadSpace) / radius;
  const arrowX = link.source.x + scalingFactor * pathVector.x;
  const arrowY = link.source.y + scalingFactor * pathVector.y;

  return `M ${link.source.x} ${link.source.y} ` +
         `L ${arrowX} ${arrowY}`;
};

const getWalkerPosition = ({walker, position, destination}) => {
  const dx = destination ? (destination.x - walker.x) * position : 0;
  const dy = destination ? (destination.y - walker.y) * position : 0;

  return `translate(${dx},${dy})`;
};

const Tangle = props =>
  <div>
    <svg width={props.width} height={props.height}>
      <defs>
        <Marker color='black' id='arrowhead' nodeRadius={props.nodeRadius} />
        <Marker color='red' id='arrowhead-approved' nodeRadius={props.nodeRadius} />
        <Marker color='blue' id='arrowhead-approving' nodeRadius={props.nodeRadius} />
      </defs>
      <g>
        {props.links.map(link =>
          <path className={`links${props.approvedLinks.has(link) ? ' approved' :
            props.pathLinks.includes(link) ? ' approved walk-path' :
              props.directWalkerApproverLinks.includes(link) ? ' approving walk-path' :
                props.approvingLinks.has(link) ? ' approving' : ''}` +
                                   `${props.invisibleNodes.includes(link.source) ? ' invisible' : ''}`}
          key={`${link.source.name}->${link.target.name}`}
          d={generateLinkPath({link, nodeRadius: props.nodeRadius})}
          markerEnd={props.approvedLinks.has(link) ? 'url(#arrowhead-approved)' :
            props.approvingLinks.has(link) ? 'url(#arrowhead-approving)' :
              'url(#arrowhead)'}
          /> )}
      </g>
      <g>
        {props.nodes.map(node =>
          <Tooltip
            visible={props.hoveredNode === node}
            key={node.name}
            placement='top'
            overlay={
              <div>
                <div>
                  Cumulative Weight: {props.hoveredNodeWeight}
                </div>
                <div>
                  Confidence: {node.confidence && node.confidence.toFixed(2)}
                </div>
              </div>}>
            <g transform={`translate(${node.x},${node.y})`} key={node.name}
              className='node'>
              {props.hoveredNode === node &&
              <g style={{opacity: 0.4}}>
                <Node nodeRadius={props.nodeRadius*1.6} />
                <Node nodeRadius={props.nodeRadius*1.3} />
              </g>}
              {props.newTransaction === node &&
              <g style={{opacity: 0.4}}>
                <Node nodeRadius={props.nodeRadius*1.6} />
                <Node nodeRadius={props.nodeRadius*1.3} />
              </g>}
              <g className={`${props.invisibleNodes.includes(node) ? 'invisible ' : ''}` +
              `${props.approvedNodes.has(node) ? 'approved' :
                props.approvingNodes.has(node) ? 'approving' :
                  props.tips.has(node) ? 'tip' : ''}`}>
                <Node
                  nodeRadius={props.nodeRadius}
                  name={node.name}
                  strokeWidth={(node.confidence && node.confidence >= 0.95) ? '4px' : '1px'}
                  mouseEntersNodeHandler={props.mouseEntersNodeHandler}
                  mouseLeavesNodeHandler={props.mouseLeavesNodeHandler} />
                {props.showLabels && <text
                  alignmentBaseline='middle' textAnchor='middle'>
                  {node.name}
                </text>}
              </g>
              {props.walker === node &&
              <g className='walker' transform={getWalkerPosition({
                walker: props.walker,
                position: props.walkerAnimationPosition,
                destination: props.walkerAnimationDestination,
              })}>
                <Node nodeRadius={props.nodeRadius*2.1} />
              </g>}
              {props.walkerDirectApproversProbabilities[node.name] &&
              props.walkerDirectApproversProbabilities[node.name].cumWeight &&
                <g className='walker-approver'>
                  <Node nodeRadius={props.nodeRadius*1.9} />
                  <line x1={-props.nodeRadius*0.9} x2={props.nodeRadius*0.9} y1={0} y2={0}
                    strokeDasharray={'4,2'} strokeWidth={1} stroke='white' />
                  <text y={props.nodeRadius*0.5}>
                    {props.walkerDirectApproversProbabilities[node.name].probability}
                  </text>
                  <text y={-props.nodeRadius*0.5}>
                    {props.walkerDirectApproversProbabilities[node.name].cumWeight}
                  </text>
                </g>}
              {props.walkerDirectApproversProbabilities[node.name] &&
              !props.walkerDirectApproversProbabilities[node.name].cumWeight &&
                <g className='walker-approver'>
                  <Node nodeRadius={props.nodeRadius*1.9} />
                  <text
                    alignmentBaseline='middle' textAnchor='middle'>
                    {props.walkerDirectApproversProbabilities[node.name].probability}
                  </text>
                </g>}
            </g>
          </Tooltip>)}
      </g>
      <g>
        <Axis
          x={props.leftMargin}
          endX={props.width - props.rightMargin}
          y={props.height - 30}
          ticks={8}
          startVal={0}
          endVal={props.nodes.length < 2 ? 1 : Math.max(...props.nodes.map(n => n.time))}
        />
      </g>
    </svg>
  </div>;

Tangle.propTypes = {
  links: PropTypes.array.isRequired,
  nodes: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  leftMargin: PropTypes.number.isRequired,
  rightMargin: PropTypes.number.isRequired,
  nodeRadius: PropTypes.number.isRequired,
  mouseEntersNodeHandler: PropTypes.func,
  mouseLeavesNodeHandler: PropTypes.func,
  approvedNodes: PropTypes.any,
  approvedLinks: PropTypes.any,
  approvingNodes: PropTypes.any,
  approvingLinks: PropTypes.any,
  hoveredNode: PropTypes.any,
  walker: PropTypes.any,
  walkerDirectApproversProbabilities: PropTypes.any,
  newTransaction: PropTypes.any,
  pathLinks: PropTypes.array,
  directWalkerApproverLinks: PropTypes.array,
  walkerAnimationDestination: PropTypes.any,
  walkerAnimationPosition: PropTypes.any,
  hoveredNodeWeight: PropTypes.any,
  hoveredNodeScore: PropTypes.any,
};

export default Tangle;
