import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { Tasks } from '../api/tasks.js';

import Task from './Task.jsx';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

//This App Component rep's the whole App...
class App extends Component {
  //construct
  constructor(props){
    super(props);
    this.state = {
      hideCompleted: false,
    };
  }
  handleSubmit(event){
    event.preventDefault();
    //find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
    /*with meteor insecure installed.. you can call db function directly..not good for production
      Tasks.insert({
      text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username,
    });*/
    Meteor.call('tasks.insert', text);
    //clear the form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }
  toggleHideCompleted(){
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }
  getTasks(){
    return [
      { _id: 1, text: 'The first Task' },
      { _id: 2, text: 'The second Task' },
      { _id: 3, text: 'The third Task' },
    ];
  }
//after adding react-meteor-data
  renderTasks(){
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted){
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;
      return (
        <Task key={task._id} task={task} showPrivateButton={showPrivateButton}/>
      );
    });
  }
//original..without db
  renderTask(){
    return this.getTasks().map((task) => (
      <Task key={task._id} task={task} />
    ));
  }

  render(){
    return (
      <div className="container">
        <header>
          <h1>My ToDo List ({this.props.incompleteCount})</h1>
          <label className="hide-completed">
            <input type="checkbox" readOnly checked={this.state.hideCompleted} onClick={this.toggleHideCompleted.bind(this)} />
          </label>
          <AccountsUIWrapper />
          { this.props.currentUser ?
            <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
              <input type="text" ref="textInput" placeholder="Add new task" />
            </form> : ''
          }
        </header>
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  tasks: PropTypes.array.isRequired,
  incompleteCount: PropTypes.number.isRequired,
  currentUser: PropTypes.object,
};

export default createContainer(()=>{
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true} }).count(),
    currentUser: Meteor.user(),
  };
}, App);
