import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import http from "./services/httpService";
import config from "./config.json";
import "./App.css";


class App extends Component {
  state = {
    posts: []
  };


  async componentDidMount() {
      const { data: posts } = await http.get(config.apiEndpoint); // zwraca liste postow
      this.setState({ posts });
  };

  handleAdd = async () => {
    const obj = {title: "a", body: "b"};
    const {data: post} = await http.post(config.apiEndpoint, obj);  // zwraca tego posta wraz z ID
    // dodanie posta do zbioru posts
    const posts = [post, ...this.state.posts];
    this.setState({posts});
  };

  handleUpdate = async post => {
    post.title = "UPDATED";
    await http.put(config.apiEndpoint + "/" + post.id, post);

    const posts = [...this.state.posts];  // klonowanie posts
    const index = posts.indexOf(post);    // znalezienie indeksu
    posts[index] = {...post};             // znalezienie obiektu po idx i zapisanie do niego nowego posta
    this.setState({ posts });       // podmiana starych posts na nowe posts
  };

  // --- Optimistic way
  // handleDelete = async post => {
  //   await axios.delete(apiEndpoint + "/" + post.id);
  //
  //   const posts = this.state.posts.filter(p => p.id !== post.id);
  //   this.setState({ posts });
  // };

  // --- Pessimistic way
  handleDelete = async post => {
    const originalPosts = this.state.posts;

    const posts = this.state.posts.filter(p => p.id !== post.id);
    this.setState({ posts });

    try {
      await http.delete("s" + config.apiEndpoint + "/" + post.id);
    } catch (ex) {
      // Expected error
      if (ex.response && ex.response.status === 404)
        alert("This post has already been deleted.")

      this.setState({ posts: originalPosts });
    }
  };

  render() {
    return (
      <React.Fragment>
        <ToastContainer/>
        <button className="btn btn-primary" onClick={this.handleAdd}>
          Add
        </button>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {this.state.posts.map(post => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => this.handleUpdate(post)}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => this.handleDelete(post)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default App;
