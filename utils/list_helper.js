const dummy = () => {
  return 1;
};

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes;
  };

  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0);
};

const favouriteBlog = (blogs) => {
  let max = 0;
  let indexMax = 0;
  blogs.forEach((element, index) => {
    if (element.likes > max) {
      max = element.likes;
      indexMax = index;
    }
  });

  const result = blogs[indexMax];

  return blogs.length === 0
    ? null
    : { title: result.title, author: result.author, likes: result.likes };
};

const mostBlogs = (blogs) => {
  const authors = [];

  for (let i = 0; i < blogs.length; i++) {
    if (!authors.includes(blogs[i].author)) {
      authors.push(blogs[i].author);
    }
  }

  const blogNumber = new Array(authors.length).fill(0);
  for (let i = 0; i < authors.length; i++) {
    for (let j = 0; j < blogs.length; j++) {
      if (blogs[j].author === authors[i]) {
        blogNumber[i]++;
      }
    }
  }

  const max =  Math.max(...blogNumber);
  const result = authors.length === 0 ? null : { author: authors[blogNumber.indexOf(max)], blogs: max };

  return result;
};

const mostLikes = (blogs) => {
  const authors = [];

  for (let i = 0; i < blogs.length; i++) {
    if (!authors.includes(blogs[i].author)) {
      authors.push(blogs[i].author);
    }
  }

  const likes = new Array(authors.length).fill(0);
  for (let i = 0; i < authors.length; i++) {
    for (let j = 0; j < blogs.length; j++) {
      if (blogs[j].author === authors[i]) {
        likes[i] += blogs[j].likes;
      }
    }
  }

  const max = Math.max(...likes);
  const result =
    authors.length === 0
      ? null
      : { author: authors[likes.indexOf(max)], likes: max };

  return result;
};

module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes };
