import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';

interface NewFlowModalProps {
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

// Rendered only while open (see NewFlowButton), so mounting it is what
// resets its state — no effect-based reset needed.
function NewFlowModal({ onClose, onSubmit }: NewFlowModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onKeyDown={handleKeyDown}>
      <form className="modal" onSubmit={handleSubmit}>
        <h2>New flow chart</h2>
        <label htmlFor="new-flow-name">Name</label>
        <input
          id="new-flow-name"
          ref={inputRef}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" disabled={submitting}>
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewFlowModal;
