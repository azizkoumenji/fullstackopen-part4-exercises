const supertest = require("supertest");
const mongoose = require("mongoose");

const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");

describe("blog tests", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    const login = await api
      .post("/api/login")
      .send({ username: "test", password: "123" });

    const blogObjects = helper.initialBlogs.map(
      (blog) => new Blog({ ...blog, user: login.body.id })
    );

    const promiseArray = blogObjects.map((blog) => {
      blog.save();
    });

    await Promise.all(promiseArray);
  }, 10000);

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test("is named id", async () => {
    const blogs = await helper.blogsInDb();
    blogs.forEach((blog) => expect(blog.id).toBeDefined());
  });

  test("a valid blog can be added", async () => {
    const login = await api
      .post("/api/login")
      .send({ username: "test", password: "123" });

    const newBlog = {
      title: "Kjdnv",
      author: "Mkcdj",
      url: "https://ijdqkjcd.com/",
      likes: 54,
    };

    await api
      .post("/api/blogs")
      .auth(login.body.token, { type: "bearer" })
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
      title: "Kjdnv",
      author: "Mkcdj",
      url: "https://ijdqkjcd.com/",
      likes: 54,
    });
  });

  test("a blog without likes defaults to zero", async () => {
    const login = await api
      .post("/api/login")
      .send({ username: "test", password: "123" });

    const newBlog = {
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
    };

    await api
      .post("/api/blogs")
      .auth(login.body.token, { type: "bearer" })
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
    const login = await api
      .post("/api/login")
      .send({ username: "test", password: "123" });

    const newBlog = {
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
    };

    await api
      .post("/api/blogs")
      .auth(login.body.token, { type: "bearer" })
      .send(newBlog)
      .expect(400);
  });

  test("deletion", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];
    const login = await api
      .post("/api/login")
      .send({ username: "test", password: "123" });

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .auth(login.body.token, { type: "bearer" })
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

    const titles = blogsAtEnd.map((r) => r.title);

    expect(titles).not.toContain(blogToDelete.title);
  });

  test("a blog without url gives status code 400", async () => {
    const login = await api
      .post("/api/login")
      .send({ username: "test", password: "123" });

    const newBlog = {
      title: "React patterns",
      author: "Michael Chan",
    };

    await api
      .post("/api/blogs")
      .auth(login.body.token, { type: "bearer" })
      .send(newBlog)
      .expect(400);
  });

  test("a blog can be modified", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToModify = blogsAtStart[0];
    const modifiedBlog = {
      ...blogToModify,
      user: blogToModify.user.toString(),
      likes: 999999,
    };

    await api
      .put(`/api/blogs/${blogToModify.id}`)
      .send(modifiedBlog)
      .expect(modifiedBlog);
  });

  test("adding a blog fails with the proper status code 401 if a token is not provided", async () => {
    const newBlog = {
      title: "Kjdnv",
      author: "Mkcdj",
      url: "https://ijdqkjcd.com/",
      likes: 54,
    };

    await api.post("/api/blogs").send(newBlog).expect(401);
  });
});

describe("invalid users are not created", () => {
  test("username must be unique", async () => {
    const result = await api
      .post("/api/users")
      .send({ username: "test", password: "123", name: "Test" })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body).toEqual({
      error:
        "User validation failed: username: Error, expected `username` to be unique. Value: `test`",
    });
  });
  test("username must be given", async () => {
    const result = await api
      .post("/api/users")
      .send({ password: "123", name: "Test" })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body).toEqual({
      error: "User validation failed: username: Path `username` is required.",
    });
  });
  test("password must be given", async () => {
    const result = await api
      .post("/api/users")
      .send({ username: "dbjgdhs", name: "Hkls" })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body).toEqual({
      error: "User validation failed: password: Path `password` is required.",
    });
  });
  test("username must be at least 3 characters long", async () => {
    const result = await api
      .post("/api/users")
      .send({ username: "db", name: "Hkls", password: "2454" })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body).toEqual({
      error:
        "User validation failed: username: Path `username` (`db`) is shorter than the minimum allowed length (3).",
    });
  });
  test("password must be at least 3 characters long", async () => {
    const result = await api
      .post("/api/users")
      .send({ username: "dbdfsd", name: "Hkls", password: "24" })
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body).toEqual({
      error: "password must be at least 3 characters long",
    });
  });
});

afterAll(async () => {
  await Blog.deleteMany({});
  await mongoose.connection.close();
});
