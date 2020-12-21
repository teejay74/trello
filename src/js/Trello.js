import TaskStorage from './TaskStorage';

export default class Trello {
  constructor() {
    this.container = document.querySelector('.task-container');
    this.todoContainer = document.getElementById('todo').querySelector('.tasks');
    this.progressContainer = document.getElementById('progress').querySelector('.tasks');
    this.doneContainer = document.getElementById('done').querySelector('.tasks');
    this.forms = document.forms;
    this.parentDiv = null;
    this.tempTask = null;
    this.dragTask = null;
    this.calcTop = null;
    this.calcLeft = null;
  }

  todo() {
    document.addEventListener('DOMContentLoaded', () => {
      this.load();
    });
    this.container.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('add-task')) {
        const textAreaTask = e.target.parentElement.querySelector('.task-form');
        if (!textAreaTask.classList.contains('task-form-active')) {
          textAreaTask.classList.add('task-form-active');
        }
      }
      if (e.target.classList.contains('delete-button-active')) {
        e.preventDefault();
        const deletedCard = e.target.parentElement;
        e.target.closest('.tasks').removeChild(deletedCard);
        this.save();
      }
      if (e.target.classList.contains('task-item')) {
        e.preventDefault();
        e.target.querySelector('.delete-button').classList.remove('delete-button-active');
        e.target.classList.remove('task-item-active');
        this.dragTask = e.target;
        this.tempTask = e.target.cloneNode(true);
        this.tempTask.classList.add('dragged');
        document.body.appendChild(this.tempTask);
        document.body.style.cursor = 'grabbing';
        this.tempTask.style.width = `${this.dragTask.offsetWidth}px`;
        const { top, left } = this.dragTask.getBoundingClientRect();
        this.calcTop = e.pageY - top;
        this.calcLeft = e.pageX - left;
        this.tempTask.style.top = `${top}px`;
        this.tempTask.style.left = `${left}px`;
      }
    });

    this.container.addEventListener('mouseover', (e) => {
      e.preventDefault();
      if (this.dragTask) return;
      if (e.target.classList.contains('task-item')) {
        e.target.classList.add('task-item-active');
        e.target.querySelector('.delete-button').classList.add('delete-button-active');
      }
    });
    this.container.addEventListener('mouseout', (e) => {
      e.preventDefault();
      if (e.target.classList.contains('task-item') && !e.relatedTarget.classList.contains('delete-button')) {
        e.target.classList.remove('task-item-active');
        e.target.querySelector('.delete-button').classList.remove('delete-button-active');
      }
    });
    this.container.addEventListener('mousemove', (e) => {
      e.preventDefault();
      if (this.dragTask) {
        this.tempTask.style.left = `${e.pageX - this.calcLeft}px`;
        this.tempTask.style.top = `${e.pageY - this.calcTop}px`;
      }
    });
    this.container.addEventListener('mouseup', (e) => {
      if (!this.dragTask) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const { top } = target.getBoundingClientRect();
      const parentDiv = target.closest('.tasks');

      if (parentDiv && parentDiv !== target) {
        if (e.pageY > window.scrollY + top + (target.offsetHeight / 2)) {
          parentDiv.insertBefore(this.dragTask, target.nextElementSibling);
        } else {
          parentDiv.insertBefore(this.dragTask, target);
        }
        this.stopMove();
        this.save();
      } else if (parentDiv) {
        parentDiv.appendChild(this.dragTask);
        this.stopMove();
        this.save();
      } else {
        this.stopMove();
        this.save();
      }
    });
    this.forms.forEach((el) => {
      el.addEventListener('submit', (e) => {
        e.preventDefault();
        const isValid = e.currentTarget.checkValidity();
        const input = [...el.elements][0];
        if (isValid) {
          const targetList = el.closest('.tasks-column').querySelector('.tasks');
          this.addTask(targetList, input.value);
          el.reset();
          el.classList.remove('task-form-active');
          this.save();
        }
      });
    });
  }

  addTask(parent, value) {
    this.parent = parent;
    const task = document.createElement('div');
    task.className = 'task-item';
    task.innerHTML = `${value} <span class='delete-button'>&#9587;</span>`;
    this.parent.appendChild(task);
  }

  stopMove() {
    document.body.removeChild(this.tempTask);
    this.tempTask = null;
    this.dragTask = null;
    document.body.style.cursor = 'auto';
  }

  save() {
    const todoTasks = this.todoContainer.querySelectorAll('.task-item');
    const progressTasks = this.progressContainer.querySelectorAll('.task-item');
    const doneTasks = this.doneContainer.querySelectorAll('.task-item');

    const data = {
      todo: [],
      progress: [],
      done: [],
    };

    todoTasks.forEach((el) => {
      data.todo.push(el.textContent.replace('╳', ''));
    });

    progressTasks.forEach((el) => {
      data.progress.push(el.textContent.replace('╳', ''));
    });

    doneTasks.forEach((el) => {
      data.done.push(el.textContent.replace('╳', ''));
    });

    TaskStorage.save(data);
  }

  load() {
    const data = JSON.parse(TaskStorage.load());
    if (data) {
      data.todo.forEach((el) => {
        this.addTask(this.todoContainer, el);
      });
      data.progress.forEach((el) => {
        this.addTask(this.progressContainer, el);
      });
      data.done.forEach((el) => {
        this.addTask(this.doneContainer, el);
      });
    }
  }
}
