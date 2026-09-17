import { BaseEdge, EdgeLabelRenderer, getBezierPath, useInternalNode, type EdgeProps } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import type { FlowEdge } from '../shared/flowTypes';
import { useEditableValue } from '../hooks/useEditableValue';
import { getEdgeParams } from './edgeGeometry';
import { useFlowInteraction } from './FlowInteractionContext';

function FloatingEdge({ id, source, target, data, style, markerEnd }: EdgeProps<FlowEdge>) {
  const { mode, updateEdgeLabel, deleteEdge } = useFlowInteraction();
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  const [label, setLabel, flushLabel] = useEditableValue(data?.label ?? '', (next) => updateEdgeLabel(id, next));

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

  const [path, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
  });

  const showLabel = mode === 'edit' || label.length > 0;

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      {showLabel && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan edge-label"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: mode === 'edit' ? 'all' : 'none',
            }}
          >
            {mode === 'edit' ? (
              <div className="edge-label-edit">
                <input
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  onBlur={flushLabel}
                  placeholder="Label..."
                />
                <button
                  type="button"
                  className="edge-delete-button"
                  onClick={() => deleteEdge(id)}
                  title="Delete edge"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <span>{label}</span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default FloatingEdge;
