import '@testing-library/jest-dom';

import React from "react";
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TodoApp from '@hexlet/react-todo-app-with-backend';
import { server } from '../__mocks__/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => {
  render(<TodoApp />);
});

const addList = async (listName) => {
  const newListInput = screen.getByRole('textbox', { name: /new list/i });

  userEvent.type(newListInput, listName);
  userEvent.click(screen.getByRole('button', { name: /add list/i }));

  expect(newListInput).toHaveAttribute('readonly');
  expect(await screen.findByRole('button', { name: listName })).toBeInTheDocument();
  expect(newListInput).not.toHaveAttribute('readonly');
};

const addTask = async (taskText) => {
  const newTaskInput = screen.getByLabelText('New task');

  userEvent.type(newTaskInput, taskText);
  userEvent.click(screen.getByRole('button', { name: 'Add' }));

  expect(newTaskInput).toHaveAttribute('readonly');
  expect(await screen.findByRole('checkbox', { name: taskText })).toBeInTheDocument();
  expect(newTaskInput).not.toHaveAttribute('readonly');
};

describe('tasks', () => {
  it('can be added to the different lists', async () => {
    const taskName = 'task uno';
    const listName = 'dos list';

    await addList('primary list');
    await addTask(taskName);
    await addList(listName);
    await userEvent.click(screen.getByRole('button', {name: listName}));

    await waitFor(() => {
      expect(screen.queryByText(taskName)).not.toBeInTheDocument();
    });
  });

  it('can not be duplicated', async () => {
    const taskName = 'repeat task';
    await addList('primary list');
    await addTask(taskName);
    await addTask(taskName);

    expect(screen.queryByText(`${taskName} already exists`)).toBeInTheDocument();
    const tasksContainer = screen.getByTestId('tasks');
    const taskItems = [...within(tasksContainer).getAllByRole('listitem')];
    expect(taskItems).toHaveLength(1);
  });

  it('can not be empty', async () => {
    userEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(await screen.findByText('Required!')).toBeInTheDocument();
  });

  it('can be created', async () => {
    const taskNames = ['first', 'second, third'];
    await addList('primary list');

    for (const task of taskNames) {
      await addTask(task);
    }
  });

  it('can be finished', async () => {
    const taskNames = ['first', 'second, third'];
    await addList('primary list');

    for (const task of taskNames) {
      await addTask(task);
    }

    const taskToClick = taskNames[1];
    const checkBox = screen.getByRole('checkbox', { name: taskToClick });
    userEvent.click(checkBox);
    await waitFor(() => {
      expect(checkBox).toBeChecked();
    });
  });

  it('can be removed', async () => {
    const taskNames = ['first', 'second, third'];
    await addList('primary list');

    for (const task of taskNames) {
      await addTask(task);
    }

    const taskToClick = taskNames[1];

    const taskItemToRemove = within(screen.getByTestId('tasks')).getByText(taskToClick).closest('li');
    userEvent.click(within(taskItemToRemove).getByRole('button'));
    await waitFor(() => {
      expect(taskItemToRemove).not.toBeInTheDocument();
    });
  });
});

describe('lists', () => {
  it('can not be duplicated', async () => {
    const listName = 'primary list';
    await addList(listName);
    await addList(listName);

    expect(screen.queryByText(`${listName} already exists`)).toBeInTheDocument();

    const listsContainer = screen.getByTestId('lists');
    const listItems = [...within(listsContainer).getAllByRole('listitem')];
    expect(listItems).toHaveLength(1);
  });

  it('can not be empty', async () => {
    userEvent.click(screen.getByRole('button', { name: /add list/i }));

    expect(await screen.findByText('Required!')).toBeInTheDocument();
  });

  it('can be deleted', async () => {
    const taskOne = 'task one';
    const taskTwo = 'task two';
    const listName = 'secondary list';

    // Add one task for each list
    await addList('primary list');
    await addTask(taskOne);
    await addList(listName);
    userEvent.click(screen.getByRole('button', { name: listName }));
    await waitFor(() => {
      expect(screen.queryByText(taskOne)).not.toBeInTheDocument();
    });

    await addTask(taskTwo);

    // Remove list
    const listItem = within(screen.getByTestId('lists')).getByText(listName).closest('div');
    userEvent.click(within(listItem).getByRole('button', { name: /remove list/i }));
    await waitFor(() => {
      expect(screen.queryByText(listName)).not.toBeInTheDocument();
      expect(screen.queryByText(taskTwo)).not.toBeInTheDocument();
    });

    // Create the list again and check tasks
    await addList(listName);
    expect((screen.queryByText('Tasks list is empty'))).toBeInTheDocument();
  });
});
