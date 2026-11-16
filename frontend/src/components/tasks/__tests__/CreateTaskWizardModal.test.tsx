import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateTaskWizardModal } from '../CreateTaskWizardModal';

jest.mock('../../../context/TaskContext', () => ({
  useTasks: () => ({
    groups: [
      { _id: 'g1', name: 'School', color: '#10B981' },
      { _id: 'g2', name: 'Work', color: '#3B82F6' },
    ],
    createTask: jest.fn().mockResolvedValue({}),
  }),
}));

describe('CreateTaskWizardModal', () => {
  it('renders all 6 full step breadcrumb titles completely without truncating to first words', () => {
    render(<CreateTaskWizardModal isOpen={true} onClose={jest.fn()} />);

    // Step breadcrumbs must show full titles, NOT truncated to "Set, Set, Set"
    expect(screen.getByText('1 · Name your task')).toBeInTheDocument();
    expect(screen.getByText('2 · Create subtasks')).toBeInTheDocument();
    expect(screen.getByText('3 · Assign Group')).toBeInTheDocument();
    expect(screen.getByText('4 · Set a due date')).toBeInTheDocument();
    expect(screen.getByText('5 · Set confidence')).toBeInTheDocument();
    expect(screen.getByText('6 · Set time to complete')).toBeInTheDocument();

    // Verify there are no duplicate truncated "Set" labels
    const setButtons = screen.queryAllByRole('button', { name: /^Set$/i });
    expect(setButtons).toHaveLength(0);
  });

  it('allows clicking previous step breadcrumb buttons to jump back', () => {
    render(<CreateTaskWizardModal isOpen={true} onClose={jest.fn()} />);

    // Step 1: fill name and click Next
    const taskInput = screen.getByLabelText(/Task Name/i);
    fireEvent.change(taskInput, { target: { value: 'Study for Chemistry' } });

    const nextBtn = screen.getByRole('button', { name: /Continue/i });
    fireEvent.click(nextBtn);

    // Now on Step 2: "Step 2 of 6"
    expect(screen.getByText(/Step 2 of 6/i)).toBeInTheDocument();

    // Step 1 breadcrumb is now a clickable past step
    const step1Btn = screen.getByRole('button', { name: '1 · Name your task' });
    expect(step1Btn).not.toBeDisabled();

    // Click step 1 breadcrumb to jump directly back
    fireEvent.click(step1Btn);
    expect(screen.getByText(/Step 1 of 6/i)).toBeInTheDocument();
  });
});
