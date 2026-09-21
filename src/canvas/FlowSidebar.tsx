import { useEditableValue } from '../hooks/useEditableValue';

interface FlowSidebarProps {
  published: boolean;
  body: string;
  onPublishedChange: (published: boolean) => void;
  onBodyChange: (body: string) => void;
}

/** Flow-level metadata shown next to the canvas in edit mode. */
function FlowSidebar({ published, body, onPublishedChange, onBodyChange }: FlowSidebarProps) {
  const [bodyValue, setBodyValue, flushBody] = useEditableValue(body, onBodyChange);

  return (
    <aside className="flow-sidebar">
      <label className="flow-sidebar-toggle">
        {/* Marks a flow as ready to be picked up by the website build. */}
        <input type="checkbox" checked={published} onChange={(event) => onPublishedChange(event.target.checked)} />
        Published
      </label>
      <label className="flow-sidebar-field">
        Body
        <textarea
          className="flow-sidebar-body"
          value={bodyValue}
          placeholder="Optional extra info about this loop…"
          onChange={(event) => setBodyValue(event.target.value)}
          onBlur={flushBody}
        />
      </label>
    </aside>
  );
}

export default FlowSidebar;
