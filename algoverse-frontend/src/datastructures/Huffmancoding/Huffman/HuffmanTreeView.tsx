import { useEffect, useRef, useState } from 'react';
import { HuffmanNode } from 'src/types/huffman';
import { calculateTreeLayout } from './utils/huffmanAlgorithm';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HuffmanTreeViewProps {
  tree: HuffmanNode | null;
  highlightedPath?: string[];
  highlightedNodes?: string[];
}

export const HuffmanTreeView = ({ tree, highlightedPath = [], highlightedNodes = [] }: HuffmanTreeViewProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (tree) {
      calculateTreeLayout(tree, 400, 50, 0, 150);
    }
  }, [tree]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-full bg-card rounded-lg border shadow-sm">
        <p className="text-muted-foreground">Huffman Tree will appear here</p>
      </div>
    );
  }

  const renderNode = (node: HuffmanNode) => {
    if (!node.x || !node.y) return null;

    const isHighlighted = highlightedNodes.includes(node.id);
    const isOnPath = highlightedPath.includes(node.id);

    return (
      <g key={node.id}>
        {/* Render children first (so edges are below nodes) */}
        {node.left && renderEdge(node, node.left, '0', highlightedPath)}
        {node.right && renderEdge(node, node.right, '1', highlightedPath)}
        {node.left && renderNode(node.left)}
        {node.right && renderNode(node.right)}

        {/* Node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={25}
          className={`
            transition-all duration-300
            ${isHighlighted 
              ? 'fill-primary stroke-primary' 
              : isOnPath
              ? 'fill-primary/20 stroke-primary'
              : node.isLeaf
              ? 'fill-card stroke-primary'
              : 'fill-muted stroke-border'
            }
          `}
          strokeWidth={isHighlighted || isOnPath ? 3 : 2}
        />

        {/* Node content */}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`
            text-sm font-bold pointer-events-none
            ${isHighlighted ? 'fill-primary-foreground' : 'fill-foreground'}
          `}
        >
          {node.char || node.frequency}
        </text>

        {/* Frequency below for internal nodes */}
        {!node.isLeaf && (
          <text
            x={node.x}
            y={node.y + 38}
            textAnchor="middle"
            className="text-xs fill-muted-foreground pointer-events-none"
          >
            ({node.frequency})
          </text>
        )}
      </g>
    );
  };

  const renderEdge = (parent: HuffmanNode, child: HuffmanNode, label: string, path: string[]) => {
    if (!parent.x || !parent.y || !child.x || !child.y) return null;

    const isOnPath = path.includes(parent.id) && path.includes(child.id);

    return (
      <g key={`${parent.id}-${child.id}`}>
        {/* Edge line */}
        <line
          x1={parent.x}
          y1={parent.y + 25}
          x2={child.x}
          y2={child.y - 25}
          className={`
            transition-all duration-300
            ${isOnPath ? 'stroke-primary' : 'stroke-border'}
          `}
          strokeWidth={isOnPath ? 3 : 2}
        />

        {/* Edge label (0 or 1) */}
        <text
          x={(parent.x + child.x) / 2}
          y={(parent.y + child.y) / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`
            text-xs font-bold pointer-events-none
            ${isOnPath ? 'fill-primary' : 'fill-muted-foreground'}
          `}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div ref={containerRef} className="bg-card rounded-lg border shadow-sm h-full overflow-auto relative">
      <Button
        onClick={toggleFullscreen}
        size="icon"
        variant="outline"
        className="absolute top-2 right-2 z-10"
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </Button>
      <svg ref={svgRef} width="800" height="500" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
        {renderNode(tree)}
      </svg>
    </div>
  );
};
