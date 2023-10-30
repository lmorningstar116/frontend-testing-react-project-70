/* eslint-disable no-undef */
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import _ from 'lodash';

const getId = () => Number(_.uniqueId());

const handlers = [
  rest.post('/api/v1/lists/:listId/tasks', (req, res, ctx) => {
    const { listId } = req.params;

    const taskId = getId();
    const task = {
      id: taskId,
      listId: parseInt(listId, 10),
      text: req.body.text,
      completed: false,
      touched: Date.now(),
    };
    sessionStorage.setItem(taskId.toString(), JSON.stringify(task));

    return res(
      ctx.status(201),
      ctx.json(task),
    );
  }),

  rest.patch('/api/v1/tasks/:taskId', (req, res, ctx) => {
    const { taskId } = req.params;

    const task = JSON.parse(sessionStorage.getItem(taskId));
    const updatedTask = {
      ...task,
      completed: req.body.completed,
      touched: Date.now(),
    };

    sessionStorage.setItem(taskId, JSON.stringify(updatedTask));
    return res(
      ctx.status(201),
      ctx.json(updatedTask),
    );
  }),

  rest.delete('/api/v1/tasks/:taskId', (req, res, ctx) => {
    const { taskId } = req.params;

    sessionStorage.removeItem(taskId);
    return res(
      ctx.status(204),
    );
  }),

  rest.post('/api/v1/lists', (req, res, ctx) => {
    const listId = getId();
    const list = {
      id: listId,
      name: req.body.name,
      removable: true,
    };
    sessionStorage.setItem(listId.toString(), JSON.stringify(list));

    return res(
      ctx.status(201),
      ctx.json(list),
    );
  }),

  rest.delete('/api/v1/lists/:listId', (req, res, ctx) => {
    const { listId } = req.params;

    sessionStorage.removeItem(listId);
    return res(
      ctx.status(204),
    );
  }),
];

export const server = setupServer(...handlers);
