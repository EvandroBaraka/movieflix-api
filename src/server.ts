import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.get('/movies', async (req, res) => {
    try {
        const movies = await prisma.movie.findMany({
            orderBy: {
                title: "asc"
            },
            include: {
                genres: true,
                languages: true
            }
        });
        res.json(movies);
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
});

app.get('/movies/:id', async (req, res) => {
    const movieId = parseInt(req.params.id)

    try {
        const movie = await prisma.movie.findMany({
            where: {
                id: movieId
            },
            include: {
                genres: true,
                languages: true
            }
        });
        res.json(movie);
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
