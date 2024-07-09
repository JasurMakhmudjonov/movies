const Joi = require("joi");
const sendMail = require("../utils/mail")
const { prisma } = require("../utils/connection");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const { createToken, checkToken } = require("../utils/jwt");

const register = async (req, res, next) => {
  try {
    const { email } = req.body;
    const schema = Joi.object({
      fullname: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.message });
    }

    const findUser = await prisma.user.findUnique({ where: { email } });
    if (findUser) {
      res.status(400).json({ message: "Email already exists" });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    await sendMail(email, otp);

    await prisma.otp.create({ data: { email, otp } });
    console.log(otp);

    res.status(201).json({ data: req.body });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, isAdmin } = req.body;

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(4).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      console.log(error);
      res.status(400).json({ message: "Permission Denied" });
    }

    const findUser = await prisma.user.findUnique({ where: { email } });
    if (!findUser) {
      res.status(403).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch) {
      res.status(403).json({ message: "Invalid email or password" });
    }

    const token = await createToken({
      id: findUser.id,
      isAdmin: findUser.isAdmin,
    });
    res.status(200).json({ message: "token",  token });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { code, email, fullname, password } = req.body;

    // Find OTP for the email created within the last 60 seconds
    const findOtp = await prisma.otp.findFirst({
      where: { email, createdAt: { gt: new Date(new Date() - 60000) } },
    });

    // Check if OTP is valid
    if (!findOtp || findOtp.otp !== code) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    // Check if user already exists
    const findUser = await prisma.user.findUnique({ where: { email } });
    if (findUser) {
      return res.status(403).json({ message: "Email already exists" });
    }

    // Hash the password
    const hashedPwd = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPwd,
      },
    });

    // Generate token
    const token = createToken({ id: user.id });
    console.log(token);

    // Respond with token
    return res.json({ message: "success", token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  verify,
};
