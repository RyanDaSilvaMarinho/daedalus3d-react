// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');


const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

let users = [
  { id: 1, email: 'user@example.com', password: 'password123' }
];

const SECRET_KEY = 'your_secret_key';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seuemail@gmail.com',
    pass: 'suasenha',
  },
});

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ message: 'Email não encontrado.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '15m' });

  const resetLink = `http://localhost:3000/reset-password/${token}`;
  const mailOptions = {
    from: 'seuemail@gmail.com',
    to: email,
    subject: 'Recuperação de Senha',
    text: `Clique no link para redefinir sua senha: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Erro ao enviar o email.' });
    }
    res.json({ message: 'Um link de recuperação foi enviado para o seu email.' });
  });
});

app.post('/api/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    user.password = password;
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (err) {
    res.status(400).json({ message: 'Token inválido ou expirado.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true, 
  }));

  app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    const userExists = users.some(u => u.email === email);
  
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já cadastrado.' });
    }
  
    const newUser = { id: users.length + 1, email, password };
    users.push(newUser);
    res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
  });