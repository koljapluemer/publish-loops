import { useEffect, useRef, useState } from 'react';

const COMMIT_DELAY_MS = 400;

// Text inputs bound to global/autosaved state (nodes, edges) must not
// re-dispatch on every keystroke: doing so rebuilds shared state and
// re-renders the whole canvas per character, which fights the browser for
// control of the input's cursor. Typing here only ever touches local state;
// the external store is caught up after a short pause (or immediately via
// `flush`, e.g. on blur) so it never fights the caret mid-keystroke.
export function useEditableValue(
  externalValue: string,
  onCommit: (value: string) => void,
): [string, (next: string) => void, () => void] {
  const [value, setValue] = useState(externalValue);
  const lastCommittedRef = useRef(externalValue);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  // Only external changes we didn't just cause ourselves (undo, switching
  // flows, another user of the same data) should override local edits.
  useEffect(() => {
    if (externalValue !== lastCommittedRef.current) {
      lastCommittedRef.current = externalValue;
      setValue(externalValue);
    }
  }, [externalValue]);

  useEffect(() => {
    if (value === lastCommittedRef.current) return undefined;
    const timer = setTimeout(() => {
      lastCommittedRef.current = value;
      onCommitRef.current(value);
    }, COMMIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [value]);

  const flush = () => {
    if (value === lastCommittedRef.current) return;
    lastCommittedRef.current = value;
    onCommitRef.current(value);
  };

  return [value, setValue, flush];
}
