import { useState } from 'react';
import { Plus } from 'lucide-react';
import NewFlowModal from './NewFlowModal';

interface NewFlowButtonProps {
  onCreate: (name: string) => Promise<void>;
}

function NewFlowButton({ onCreate }: NewFlowButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" className="icon-button" onClick={() => setIsOpen(true)} title="New flow chart">
        <Plus size={18} />
      </button>
      {isOpen && <NewFlowModal onClose={() => setIsOpen(false)} onSubmit={onCreate} />}
    </>
  );
}

export default NewFlowButton;
