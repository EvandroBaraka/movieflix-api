import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

app.get('/movies', async (_, res) => {
    try {
        const movies = await prisma.movie.findMany({
            orderBy: {
                title: 'asc',
            },
            include: {
                genres: true,
                languages: true,
            },
        });
        res.json(movies);
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
});

app.post('/movies', async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } =
        req.body;

    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { title: { equals: title, mode: 'insensitive' } },
        });

        if (movieWithSameTitle) {
            return res.status(409).send({
                message: 'Já existe um filme cadastrado com esse título.',
            });
        }

        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    } catch (error) {
        return res
            .status(500)
            .send({ message: `Falha ao cadastrar um filme - ${error}` });
    }

    res.status(201).send();
});

app.get('/movies/:id', async (req, res) => {
    const movieId = parseInt(req.params.id);

    try {
        const movie = await prisma.movie.findMany({
            where: {
                id: movieId,
            },
            include: {
                genres: true,
                languages: true,
            },
        });
        res.json(movie);
    } catch (error) {
        console.error('Erro detalhado:', error);
        res.status(500).json({ error: 'Erro ao buscar filmes' });
    }
});

app.put('/movies/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });

        if (!movie) {
            return res.status(404).send({ message: 'Filme não encontrado.' });
        }

        const data = { ...req.body };

        data.release_date = data.release_date
            ? new Date(data.release_date)
            : undefined;

        await prisma.movie.update({
            where: {
                id,
            },
            data: data,
        });
    } catch (error) {
        return res
            .status(500)
            .send({ message: 'Falha ao atualizar o registro do filme' });
    }
    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
