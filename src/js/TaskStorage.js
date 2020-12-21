export default class TaskStorage {
  static save(data) {
    localStorage.setItem('tasks', JSON.stringify(data));
  }

  static load() {
    return localStorage.getItem('tasks');
  }
}
