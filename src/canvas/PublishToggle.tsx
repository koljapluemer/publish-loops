interface PublishToggleProps {
  published: boolean;
  onChange: (published: boolean) => void;
}

/** Marks a flow as ready to be picked up by the website build. */
function PublishToggle({ published, onChange }: PublishToggleProps) {
  return (
    <label className="publish-toggle">
      <input type="checkbox" checked={published} onChange={(event) => onChange(event.target.checked)} />
      Published
    </label>
  );
}

export default PublishToggle;
