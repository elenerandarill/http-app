import React, { Component } from "react";
import axios from "axios";
import "./App.css";


// Unexpected errors handling
axios.interceptors.response.use(null, error => {
  const expectedError = error.response && error.response.status >= 400 && error.response.status < 500;

  if (!expectedError) {
    console.log("Logging the error", error);
    alert("An unexpected error occurred.");
  }

  return Promise.reject(error);
});


const apiEndpoint = "http://jsonplaceholder.typicode.com/posts";


class App extends Component {
  state = {
    posts: []
  };


  async componentDidMount() {
      const { data: posts } = await axios.get(apiEndpoint); // zwraca liste postow
      this.setState({ posts });
  };

  handleAdd = async () => {
    const obj = {title: "a", body: "b"};
    const {data: post} = await axios.post(apiEndpoint, obj);  // zwraca tego posta wraz z ID
    // dodanie posta do zbioru posts
    const posts = [post, ...this.state.posts];
    this.setState({posts});
  };

  handleUpdate = async post => {
    post.title = "UPDATED";
    await axios.put(apiEndpoint + "/" + post.id, post);

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
      await axios.delete(apiEndpoint + "/" + post.id);
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
