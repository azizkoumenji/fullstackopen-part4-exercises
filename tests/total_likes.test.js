const totalLikes = require("../utils/list_helper").totalLikes;

describe("total likes", () => {
  test("of empty list is zero", () => {
    expect(totalLikes([])).toBe(0);
  });

  test("when list has only one blog", () => {
    expect(
      totalLikes([
        {
          _id: "5a422aa71b54a676234d17f8",
          title: "Go To Statement Considered Harmful",
          author: "Edsger W. Dijkstra",
          url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
          likes: 5,
          __v: 0,
        },
      ])
    ).toBe(5);
  });

  test("of a bigger list is calculated right", () => {
    expect(
      totalLikes([
        {
          _id: "5a422aa71b54a676234d17f8",
          title: "Go To Statement Considered Harmful",
          author: "Edsger W. Dijkstra",
          url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
          likes: 5,
          __v: 0,
        },
        {
          _id: "648f095dd8921abb6ab85759",
          title: "Title Test",
          author: "Blo",
          url: "website.com",
          likes: 2,
          __v: 0,
        },
      ])
    ).toBe(7);
  });
});
