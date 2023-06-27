const supertest = require("supertest");
const mongoose = require("mongoose");

const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test("is named id", async () => {
  const blogs = await helper.blogsInDb();
  blogs.forEach((blog) => expect(blog.id).toBeDefined());
});

test("a valid blog can be added", async () => {
  const newBlog = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const contents = blogsAtEnd.map((n) => ({
    title: n.title,
    author: n.author,
    url: n.url,
    likes: n.likes,
  }));
  expect(contents).toContainEqual({
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  });
});

test("a blog without likes defaults to zero", async () => {
  const newBlog = {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();

  const contents = blogsAtEnd.map((n) => ({
    title: n.title,
    author: n.author,
    url: n.url,
    likes: n.likes,
  }));
  expect(contents).toContainEqual({
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 0,
  });
});

test("a blog without title gives status code 400", async () => {
  const newBlog = {
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(400);
});

test("a blog without url gives status code 400", async () => {
  const newBlog = {
    title: "React patterns",
    author: "Michael Chan",
  };

  await api.post("/api/blogs").send(newBlog).expect(400);
});

test("deletion", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  const blogsAtEnd = await helper.blogsInDb();

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

  const titles = blogsAtEnd.map((r) => r.title);

  expect(titles).not.toContain(blogToDelete.title);
});

test("a blog can be modified", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToModify = blogsAtStart[0];
  const modifiedBlog = { ...blogToModify, likes: 999999 };

  await api.put(`/api/blogs/${blogToModify.id}`).send(modifiedBlog).expect(modifiedBlog);
});

afterAll(async () => {
  await mongoose.connection.close();
});
