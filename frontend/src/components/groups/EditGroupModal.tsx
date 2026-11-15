import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { GroupItem } from '../../api/groupApi';
import { useTasks } from '../../context/TaskContext';

interface EditGroupModalProps {
  group: GroupItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const PALETTE = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#64748B'];

export const EditGroupModal: React.FC<EditGroupModalProps> = ({ group, isOpen, onClose }) => {
  const { updateGroup } = useTasks();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10B981');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name);
      setColor(group.color || '#10B981');
      setError('');
    }
  }, [group, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !name.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      await updateGroup(group._id, { name: name.trim(), color });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Group"
      subtitle="Update this category's name or color label."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Group Name"
          placeholder="e.g. Computer Science, Personal..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-2">
            Color Tag
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-offset-2 ring-sage-600' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
