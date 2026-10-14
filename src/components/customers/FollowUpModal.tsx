import React, { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '../../contexts/StoreContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, inputCls } from '../ui/Field';
import { TODAY, addDaysStr } from '../../utils/date';

interface FollowUpModalProps {
  open: boolean;
  onClose: () => void;
  customerId?: string;
}

export function FollowUpModal({ open, onClose, customerId }: FollowUpModalProps) {
  const store = useStore();
  const [cid, setCid] = useState(customerId ?? '');
  const [due, setDue] = useState(addDaysStr(TODAY, 3));
  const [note, setNote] = useState('');
  const valid = (customerId || cid) && due && note.trim().length > 2;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule a follow-up"
      description="You’ll get a reminder on the due date."
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
          variant="primary"
          disabled={!valid}
          onClick={() => {
            store.addFollowUp({ customerId: customerId ?? cid, due, note });
            toast.success('Follow-up scheduled');
            setNote('');
            onClose();
          }}>
          
            Schedule
          </Button>
        </>
      }>
      
      <div className="space-y-4">
        {!customerId &&
        <Field label="Customer" htmlFor="fu-c" required>
            <select id="fu-c" className={inputCls} value={cid} onChange={(e) => setCid(e.target.value)}>
              <option value="">Select customer</option>
              {store.customers.filter((c) => store.inScope(c.franchiseId)).map((c) =>
            <option key={c.id} value={c.id}>
                  {c.name}
                </option>
            )}
            </select>
          </Field>
        }
        <Field label="Due date" htmlFor="fu-due" required>
          <input id="fu-due" type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
        <Field label="What needs to happen?" htmlFor="fu-note" required>
          <textarea id="fu-note" rows={3} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Send spring fundraiser dates" />
        </Field>
      </div>
    </Modal>);

}