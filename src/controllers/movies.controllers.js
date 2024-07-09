const Joi = require("joi");

const { prisma } = require("../utils/connection");

const create = async (req, res) => {
  try {
    const { title, description, year, duration, link, genre } = req.body;
    const schema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      year: Joi.string().required(),
      duration: Joi.string().required(),
      link: Joi.string().required(),
      genre: Joi.string()
        .valid("horror", "drama", "comedy", "romance", "fantastic", "melodrama")
        .required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json(error.message);
    }
    const newMovie = await prisma.movie.create({
      data: {
        title,
        description,
        year,
        duration,
        link,
        genre,
      },
    });
    return res.status(201).json({ data: newMovie });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Interval server  error" });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, year, duration, link, genre } = req.body;

    const schema = Joi.object({
      title: Joi.string(),
      description: Joi.string(),
      year: Joi.string(),
      duration: Joi.string(),
      link: Joi.string(),
      genre: Joi.string().valid(
        "horror",
        "drama",
        "comedy",
        "romance",
        "fantastic"
      ),
    });

    const { error } = schema.validate({
      title,
      description,
      year,
      duration,
      link,
      genre,
    });
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: {
        title,
        description,
        year,
        duration,
        link,
        genre,
      },
    });

    return res.status(200).json({ message: "Movie updated", updatedMovie });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Interval Server Error" });
  }
};

const show = async (req, res) => {
  try {
    const movies = await prisma.movie.findMany({
      where: {
        deletedAt: null,
      },
    });

    if (movies.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    for (let index = 0; index < movies.length; index++) {
      const element = movies[index];
      let viewers = element.viewers;
      if (!viewers.includes(req.user.id)) {
        viewers.push(req.user.id);
        await prisma.movie.update({
          where: { id: element.id },
          data: {
            viewers,
            views: viewers.length,
          },
        });
      }
    }

    res.json({ data: movies });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.movie.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
    res.json({ message: "Movie deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  create,
  update,
  show,
  remove,
};
